import {Command, emoji} from '../../helpers/discord'
import {oneLine} from 'common-tags'
import {ChatInputCommandInteraction} from 'discord.js'
import {validateInputAndModifyEntryList} from '../db/functions'
import {notificationCommand} from '../../helpers/discord/slash'

export const twitcast: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Notifs',
    description: 'Starts or stops sending twitcasting livestream notifs in the current channel.',
  },
  slash: notificationCommand({name: 'twitcast', subject: 'twitcasting streams', default_permission: 2}),
  callback: async (intr: ChatInputCommandInteraction): Promise<void> => {
    const streamer = intr.options.getString('channel')!
    validateInputAndModifyEntryList({
      intr,
      verb: intr.options.getSubcommand(true) as 'add' | 'remove' | 'clear' | 'viewcurrent',
      streamer,
      role: intr.options.getRole('role')?.id,
      feature: 'twitcasting',
      add: {
        success: `${emoji.tc} Notifying twitcasting lives for`,
        failure: oneLine`
          :warning: ${streamer}'s twitcasting lives are already being
          relayed in this channel.
        `,
      },
      remove: {
        success: `${emoji.tc} Stopped notifying twitcasting lives by`,
        failure: oneLine`
          :warning: ${streamer}'s twitcasting lives weren't already being
          notified in <#${intr.channel!.id}>. Are you in the right channel?
        `,
      },
    })
  },
}
