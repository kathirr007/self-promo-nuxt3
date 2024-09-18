// import { onlyAdmin, onlyAuthUser } from '@/server/controllers/auth.js'
import { getProducts } from '@/server/controllers/project'

export default defineEventHandler(async () => {
  // const body = readBody(event)
  // console.log('body', body)
  const products = await getProducts()
  return products
})

/* const getMessages = async (
  uid: number,
  page: number,
  limit: number,
  type: MessageType | '',
  sortField: SortField,
  sortOrder: KunOrder
) => {
  const skip = (page - 1) * limit

  const sortOptions: Record<string, 'asc' | 'desc'> = {
    [sortField]: sortOrder === 'asc' ? 'asc' : 'desc'
  }
  const queryData = type ? { receiver_uid: uid, type } : { receiver_uid: uid }

  const data = await MessageModel.find(queryData)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('user', 'name', UserModel)
    .lean()

  const totalCount = await MessageModel.countDocuments(queryData)
  const messages: Message[] = data.map((message) => ({
    mid: message.mid,
    senderUid: message.sender_uid,
    senderName: message.user[0].name,
    receiverUid: message.receiver_uid,
    time: message.time,
    tid: message.tid,
    status: message.status,
    type: message.type
  }))

  return { messages, totalCount }
}

export default defineEventHandler(async (event) => {
  const { page, limit, type, sortField, sortOrder }: MessageRequestData =
    await getQuery(event)
  if (limit !== '10') {
    return kunError(event, 10209)
  }

  const userInfo = await getCookieTokenInfo(event)
  if (!userInfo) {
    return kunError(event, 10115, 205)
  }
  const uid = userInfo.uid

  const result = await getMessages(
    uid,
    parseInt(page),
    parseInt(limit),
    type || '',
    sortField || 'time',
    sortOrder
  )

  return result
}) */
