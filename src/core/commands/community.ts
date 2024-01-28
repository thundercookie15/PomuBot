import {Command} from '../../helpers/discord'
import {oneLine} from 'common-tags'
import {ChatInputCommandInteraction} from 'discord.js'
import {validateInputAndModifyEntryList} from '../db/functions'
import {notificationCommand} from '../../helpers/discord/slash'

export const community: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Notifs',
    description: `Starts or stops sending community post notifs in the current channel.`,
  },
  slash: notificationCommand({name: 'community', subject: 'community posts', default_permission: 8192}),
  callback: (intr: ChatInputCommandInteraction): void => {
    const streamer = intr.options.getString('channel')!
    validateInputAndModifyEntryList({
      intr,
      verb: intr.options.getSubcommand(true) as 'add' | 'remove' | 'clear',
      streamer,
      role: intr.options.getRole('role')?.id,
      feature: 'community',
      add: {
        success: `:family_mmbb: Notifying community posts by`,
        failure: oneLine`
          :warning: ${streamer}'s community posts are already being
          relayed in this channel.
        `,
      },
      remove: {
        success: `:family_mmbb: Stopped notifying community posts by`,
        failure: oneLine`
          :warning: ${streamer}'s community posts weren't already being notified
          in <#${intr.channel!.id}>. Are you in the right channel?
        `,
      },
    })
  },
}
