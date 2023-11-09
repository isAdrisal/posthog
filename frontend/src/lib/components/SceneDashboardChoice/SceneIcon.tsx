import { DashboardCompatibleScenes, Scene } from 'scenes/sceneTypes'
import { IconCottage, IconPerson } from 'lib/lemon-ui/icons'
import clsx from 'clsx'

export function SceneIcon(props: { scene: DashboardCompatibleScenes; size: 'small' | 'large' }): JSX.Element | null {
    const className = clsx('text-warning', props.size === 'small' ? 'text-lg' : 'text-3xl')
    if (props.scene === Scene.ProjectHomepage) {
        return <IconCottage className={className} />
    } else if (props.scene === Scene.Group) {
        return <IconPerson className={className} />
    } else if (props.scene === Scene.Person) {
        return <IconPerson className={className} />
    } else {
        return null
    }
}
