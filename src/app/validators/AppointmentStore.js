import * as Yup from 'yup'
import HTTP from '../../utils/httpResponse'

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    })

    await schema.validate(req.body, { aborEarly: false })
    return next()
  } catch (e) {
    return res.status(HTTP.BAD_REQUEST).json({ error: e.errors })
  }
}
