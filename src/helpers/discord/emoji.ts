export const emoji: Record<Name, EmojiCode> = {
  respond: '<:NinaExcited:1009724066346840114>',
  deepl: '<:deepL:1097446259465408584>',
  nbsp: '<:nbsp:832910690998026260>',
  discord: '<:Discord:1009723380188061746>',
  holo: '<:Hololive:1009723078722469968>',
  Speaker: '<:Speaker:1054441562286850239>',
  ping: '<:LuLuPeek:1009722823075430460>',
  tc: '<:TwitCasting:1009722538080882760>',
  yt: '<:YouTube:1009722198073815122>',
  peek: '<:PomuPeek:1009721716295090206>',
  phaseconnect: '<:PhaseConnect:1136302945810526290>',
  prism: '<:Prism:1136303642346016891>',
  niji: '<:nijisanji:1009718487364673566>',
  nijien: '<:NijiEN:1096841263317254315>',
  idol: '<:Idol:1097457745428480030>',
  vshojo: '<:VShojo:1097425316999340052>',
  vreverie: '<:VReverie:1151564975257686248>',
  prechat: '<:PreChat:1097459065619238922>',
} as const

///////////////////////////////////////////////////////////////////////////////

type Name = string
type EmojiCode = string
