import * as Sentry from '@sentry/react'
import { FEATURE_FLAGS } from 'lib/constants'
import posthog, { PostHogConfig } from 'posthog-js'

const configWithSentry = (config: Partial<PostHogConfig>): Partial<PostHogConfig> => {
    if ((window as any).SENTRY_DSN) {
        config.on_xhr_error = (failedRequest: XMLHttpRequest) => {
            const status = failedRequest.status
            const statusText = failedRequest.statusText || 'no status text in error'
            Sentry.captureException(
                new Error(`Failed with status ${status} while sending to PostHog. Message: ${statusText}`),
                { tags: { status, statusText } }
            )
        }
    }
    return config
}

export function loadPostHogJS(): void {
    window.console.warn('LOADING POSTHOG')
    if (window.JS_POSTHOG_API_KEY) {
        window.console.warn('LOADING POSTHOG WITH KEY', window.JS_POSTHOG_API_KEY)
        const config = configWithSentry({
            api_host: window.JS_POSTHOG_HOST,
            ui_host: window.JS_POSTHOG_UI_HOST,
            rageclick: true,
            persistence: 'localStorage+cookie',
            opt_out_useragent_filter: true,
            bootstrap: window.POSTHOG_USER_IDENTITY_WITH_FLAGS ? window.POSTHOG_USER_IDENTITY_WITH_FLAGS : {},
            opt_in_site_apps: true,
            api_transport: 'fetch',
            loaded: (posthog) => {
                if (posthog.sessionRecording) {
                    posthog.sessionRecording._forceAllowLocalhostNetworkCapture = true
                }

                if (window.IMPERSONATED_SESSION) {
                    window.console.warn('IMPERSONATING SESSION', window.IMPERSONATED_SESSION)
                    posthog.opt_out_capturing()
                } else {
                    window.console.warn('OPTING IN CAPTURING')
                    posthog.opt_in_capturing()
                }
            },
            scroll_root_selector: ['main', 'html'],
            autocapture: {
                capture_copied_text: true,
            },
            person_profiles: 'always',

            // Helper to capture events for assertions in Cypress
            _onCapture: (event, eventPayload) => {
                // ;(window as any).console.warn('in event handler _CYPRESS_POSTHOG_CAPTURES', (window as any)._cypress_posthog_captures)
                // ;(window as any).console.warn('in event handler _CYPRESS_POSTHOG_CAPTURES EVENT', event)
                // ;(window as any).console.warn('in event handler _CYPRESS_POSTHOG_CAPTURES EVENT Data', eventPayload)
                //
                // if not exist, initialize as empty array
                const captures = (window as any)._cypress_posthog_captures || []
                captures.push(eventPayload)
                ;(window as any).console.warn(
                    ' POST_DEBUG_CYPRESS_TEST_FAILURE in event handler, a NOOP , event is ',
                    event,
                    ` payload is `,
                    eventPayload,
                    ` captures is `,
                    captures
                )
                ;(window as any)._cypress_posthog_captures = captures
            },
        })

        // window.console.warn('POSTHOG CONFIG _onCapture is ,', config._onCapture?.toString())

        const instance = posthog.init(window.JS_POSTHOG_API_KEY, config)
        instance?._addCaptureHook((event, payload) => {
            ;(window as any).console.warn('DEBUG: _addCaptureHook :: event is  ', event, '  payload is ', payload)
        })

        window.posthog?.capture('capturing posthog event')
        window.console.warn('POSTHOG LOADED, STANDARD EVENT CAPTURED')
        if (config._onCapture) {
            config._onCapture('capturing posthog event', {
                uuid: '01919505-3a07-7404-b4de-1877b907e539',
                event: 'capturing posthog event',
                properties: {},
            })
        } else {
            window.console.warn('POSTHOG CONFIG _onCapture is undefined, cannot be called')
        }
        window.console.warn('POSTHOG LOADED, EVENT CAPTURED VIA _ONCAPTURE DIRECTLY')
        window.console.warn('WHAT IS IN _CYPRESS_POSTHOG_CAPTURES', window._cypress_posthog_captures)

        const Cypress = (window as any).Cypress

        if (Cypress) {
            Object.entries(Cypress.env()).forEach(([key, value]) => {
                if (key.startsWith('POSTHOG_PROPERTY_')) {
                    posthog.register_for_session({
                        [key.replace('POSTHOG_PROPERTY_', 'E2E_TESTING_').toLowerCase()]: value,
                    })
                }
            })
        }

        // This is a helpful flag to set to automatically reset the recording session on load for testing multiple recordings
        const shouldResetSessionOnLoad = posthog.getFeatureFlag(FEATURE_FLAGS.SESSION_RESET_ON_LOAD)
        if (shouldResetSessionOnLoad) {
            posthog.sessionManager?.resetSessionId()
        }
        // Make sure we have access to the object in window for debugging
        window.posthog = posthog
    } else {
        window.console.warn('POSTHOG NOT LOADED')
        posthog.init('fake token', {
            autocapture: false,
            loaded: function (ph) {
                ph.opt_out_capturing()
            },
        })
    }

    if (window.SENTRY_DSN) {
        Sentry.init({
            dsn: window.SENTRY_DSN,
            environment: window.SENTRY_ENVIRONMENT,
            ...(location.host.includes('posthog.com') && {
                integrations: [new posthog.SentryIntegration(posthog, 'posthog', 1899813, undefined, '*')],
            }),
        })
    }
}
