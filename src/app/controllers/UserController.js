import User from '../models/User'
import File from '../models/File'
import HTTP from '../../utils/httpResponse'
import Cache from '../../lib/Cache'

class UserController {
  async store(req, res) {
    const { body } = req
    let user = await User.findOne({ where: { email: body.email } })

    if (user) {
      return res
        .status(HTTP.BAD_REQUEST)
        .json({ error: 'The e-mail is already used' })
    }

    user = await User.create(body)

    if (user.provider) await Cache.invalidate('providers')

    return res.status(HTTP.CREATED).json({ user })
  }

  async update(req, res) {
    const { email, oldPassword } = req.body
    let user = await User.findByPk(req.userId)

    if (email && email !== user.email) {
      if ((await User.count({ where: { email } })) > 0) {
        return res
          .status(HTTP.BAD_REQUEST)
          .json({ error: 'The e-mail is already used' })
      }
    }

    if (oldPassword && !(await user.isPasswordCorrect(oldPassword))) {
      return res
        .status(HTTP.UNAUTHORIZED)
        .json({ error: 'Credentials do not match' })
    }

    await user.update(req.body)

    user = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
        },
      ],
    })

    return res.json({ user })
  }
}

export default new UserController()
