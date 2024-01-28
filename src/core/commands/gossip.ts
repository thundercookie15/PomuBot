import {Command, emoji} from '../../helpers/discord'
import {oneLine} from 'common-tags'
import {ChatInputCommandInteraction} from 'discord.js'
import {validateInputAndModifyEntryList} from '../db/functions'
import {notificationCommand} from '../../helpers/discord/slash'

export const gossip: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Notifs',
    description: oneLine`
      Start or stop relaying a streamer's mentions in other
      streamers' livechat (includes translations and streamer comments).
    `,
  },
  slash: notificationCommand({name: 'gossip', subject: 'gossip', default_permission: 8192}),
  callback: (intr: ChatInputCommandInteraction) => {
    const streamer = intr.options.getString('channel')!
    validateInputAndModifyEntryList({
      intr,
      verb: intr.options.getSubcommand(true) as 'add' | 'remove' | 'clear' | 'viewcurrent',
      streamer,
      role: intr.options.getRole('role')?.id,
      feature: 'gossip',
      add: {
        success: `${emoji.peek} Relaying gossip in other chats`,
        failure: oneLine`
          :warning: Gossip about ${streamer} in other chats already being
          relayed in this channel.
        `,
      },
      remove: {
        success: `${emoji.Speaker} Stopped relaying gossip`,
        failure: oneLine`
          :warning: Gossip about ${streamer} wasn't already being relayed
          in <#${intr.channel!.id}>. Are you in the right channel?
        `,
      },
    })
  },
}
