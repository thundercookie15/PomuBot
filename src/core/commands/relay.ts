import {Command} from '../../helpers/discord'
import {oneLine} from 'common-tags'
import {ChatInputCommandInteraction} from 'discord.js'
import {validateInputAndModifyEntryList} from '../db/functions'
import {notificationCommand} from '../../helpers/discord/slash'

export const relay: Command = {
  config: {
    permLevel: 2,
  },
  help: {
    category: 'Relay',
    description: oneLine`
      Start or stop relaying a streamer's translations (and owner/other
      streamer messages), in the current Discord channel.
    `,
  },
  slash: notificationCommand({name: 'relay', subject: 'start of TL relays'}),
  callback: (intr: ChatInputCommandInteraction): void => {
    const streamer = intr.options.getString('channel')!
    validateInputAndModifyEntryList({
      intr,
      verb: intr.options.getSubcommand(true) as 'add' | 'remove' | 'clear' | 'viewcurrent',
      streamer,
      role: intr.options.getRole('role')?.id,
      feature: 'relay',
      add: {
        success: `:speech_balloon: Relaying TLs for`,
        failure: `
           :warning: ${streamer} is already being relayed in this channel
        `,
      },
      remove: {
        success: `:speech_balloon: Stopped relaying TLs for`,
        failure: oneLine`
          :warning: ${streamer}'s translations weren't already being relayed
          in <#${intr.channel!.id}>. Are you in the right channel?
        `,
      },
    })
  },
}
