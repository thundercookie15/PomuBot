import {Command, emoji} from '../../helpers/discord'
import {oneLine} from 'common-tags'
import {ChatInputCommandInteraction} from 'discord.js'
import {validateInputAndModifyEntryList} from '../db/functions'
import {notificationCommand} from '../../helpers/discord/slash'

export const youtube: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Notifs',
    description: `Starts or stops sending youtube livestream notifs in the current channel.`,
  },
  slash: notificationCommand({name: 'youtube', subject: 'YouTube lives', default_permission: 8192}),
  callback: async (intr: ChatInputCommandInteraction): Promise<void> => {
    const streamer = intr.options.getString('channel')!
    validateInputAndModifyEntryList({
      intr,
      verb: intr.options.getSubcommand(true) as 'add' | 'remove' | 'clear' | 'viewcurrent',
      streamer,
      role: intr.options.getRole('role')?.id,
      feature: 'youtube',
      add: {
        success: `${emoji.yt} Notifying YouTube lives for`,
        failure: oneLine`
          :warning: ${streamer}'s YouTube lives are already being
          relayed in this channel.
        `,
      },
      remove: {
        success: `${emoji.yt} Stopped notifying YouTube lives by`,
        failure: oneLine`
          :warning: ${streamer}'s YouTube lives weren't already being
          notified in <#${intr.channel!.id}>. Are you in the right channel?
        `,
      },
    })
  },
}
