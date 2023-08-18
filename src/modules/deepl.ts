import {config} from '../config'
import {asyncTryOrLog} from '../helpers/tryCatch'
import {getJson} from '../helpers/'

export async function tl(text: string, language: string): Promise<string> {
  const tlObject = await asyncTryOrLog(() =>
    getJson('https://api-free.deepl.com/v2/translate', {
      body: `auth_key=${config.deeplKey}&text=${text}&target_lang=${language}`,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      method: 'POST',
    }),
  )
  const hasTl = tlObject?.translations !== undefined
  const wasEng = tlObject?.translations?.[0].detected_source_language === 'EN'

  return wasEng && hasTl ? text : tlObject?.translations?.[0].text ?? text
}

