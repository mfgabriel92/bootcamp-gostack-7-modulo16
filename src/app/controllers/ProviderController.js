import User from '../models/User'
import File from '../models/File'
import Cache from '../../lib/Cache'

class ProviderController {
  async index(req, res) {
    const cached = await Cache.get('providers')

    if (cached) return res.json(cached)

    const providers = await User.findAll({
      where: { provider: true },
      include: [
        {
          model: File,
          as: 'avatar',
        },
      ],
    })

    await Cache.set('providers', providers)
    return res.json({ providers })
  }
}

export default new ProviderController()
