import axios from 'axios'

exports.handler = async function (event) {
  let sendInfo
  try {
    sendInfo = JSON.parse(event.body)
    if (!sendInfo) {
      throw 'error'
    }
  } catch {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'error' }),
    }
  }

  if (Object.values(sendInfo).length < 3) {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'error' }),
    }
  }
  const { name, message, email } = sendInfo

  const { NEXT_API_TELEGRAM_TOKEN, NEXT_GROUP_TELEGRAM, NEXT_MESSAGE_THREAD_ID } =
    process.env

  const telegramURL = NEXT_MESSAGE_THREAD_ID
    ? `https://api.telegram.org/bot${NEXT_API_TELEGRAM_TOKEN}/sendMessage?text=${encodeURI(
        `Name: ${name}\nEmail: ${email}\nText: ${message}`
      )}&chat_id=${NEXT_GROUP_TELEGRAM}&message_thread_id=${NEXT_MESSAGE_THREAD_ID}`
    : `https://api.telegram.org/bot${NEXT_API_TELEGRAM_TOKEN}/sendMessage?text=${encodeURI(
        `Name: ${name}\nEmail: ${email}\nText: ${message}`
      )}&chat_id=${NEXT_GROUP_TELEGRAM}`

  await axios.get(telegramURL)

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok' }),
  }
}
