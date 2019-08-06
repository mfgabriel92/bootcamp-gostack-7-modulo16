import CreateAppointmentService from '../services/CreateAppointmentService'
import CancelAppointmentService from '../services/CancelAppointmentService'
import Appointment from '../models/Appointment'
import User from '../models/User'
import File from '../models/File'
import HTTP from '../../utils/httpResponse'
import Cache from '../../lib/Cache'

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query
    const cacheKey = `user:${req.userId}:appointments:${page}`
    const cached = await Cache.get(cacheKey)

    if (cached) return res.json(cached)

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
            },
          ],
        },
      ],
    })

    await Cache.set(cacheKey, appointments)
    return res.json({ appointments })
  }

  async store(req, res) {
    const { provider_id, date } = req.body

    try {
      const appointment = await CreateAppointmentService.run({
        user_id: req.userId,
        provider_id,
        date,
      })

      return res.status(HTTP.CREATED).json({ appointment })
    } catch (e) {
      return res.status(e.code).json(e.message)
    }
  }

  async delete(req, res) {
    const { id } = req.params

    try {
      const appointment = await CancelAppointmentService.run({
        user_id: req.userId,
        id,
      })

      return res.json({ appointment })
    } catch (e) {
      return res.status(e.code).json(e.message)
    }
  }
}

export default new AppointmentController()
