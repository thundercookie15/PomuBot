import {Command, emoji} from '../../helpers/discord'
import {oneLine} from 'common-tags'
import {ChatInputCommandInteraction} from 'discord.js'
import {validateInputAndModifyEntryList} from '../db/functions'
import {notificationCommand} from '../../helpers/discord/slash'

export const cameos: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Notifs',
    description: oneLine`
      Start or stop relaying a streamer's appearances in other
      streamers' livechat.
    `,
  },
  slash: notificationCommand({name: 'cameos', subject: 'cameos', default_permission: 2}),
  callback: (intr: ChatInputCommandInteraction): void => {
    const streamer = intr.options.getString('channel')!
    validateInputAndModifyEntryList({
      intr,
      verb: intr.options.getSubcommand(true) as 'add' | 'remove' | 'clear' | 'viewcurrent',
      streamer,
      role: intr.options.getRole('role')?.id,
      feature: 'cameos',
      add: {
        success: `${emoji.Speaker} Relaying cameos in other chats`,
        failure: oneLine`
          :warning: ${streamer}'s cameos in other chats already being
          relayed in this channel.
        `,
      },
      remove: {
        success: `${emoji.Speaker} Stopped relaying chat cameos`,
        failure: oneLine`
          :warning: ${streamer}'s cameos' weren't already being relayed
          in <#${intr.channel!.id}>. Are you in the right channel?
        `,
      },
    })
  },
}
