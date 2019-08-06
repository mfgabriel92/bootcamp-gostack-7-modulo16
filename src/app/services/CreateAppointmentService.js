import {
  startOfHour,
  parseISO,
  isBefore,
  format,
  subMinutes,
  addMinutes,
} from 'date-fns'
import { Op } from 'sequelize'
import User from '../models/User'
import Appointment from '../models/Appointment'
import Notification from '../schemas/Notification'
import HTTP from '../../utils/httpResponse'
import ErrorMessage from './ErrorMessage'
import Cache from '../../lib/Cache'

class CreateAppointmentService {
  async run({ user_id, provider_id, date }) {
    if (user_id === provider_id) {
      throw new ErrorMessage(
        HTTP.BAD_REQUEST,
        'You cannot create an appointment with yourself'
      )
    }

    // Is Provider
    const provider = await User.findOne({
      where: { id: provider_id, provider: true },
    })

    if (!provider) {
      throw new ErrorMessage(
        HTTP.BAD_REQUEST,
        'You may only create appointments with providers'
      )
    }

    // Is before today
    const startingHour = startOfHour(parseISO(date))
    const oneHourBefore = subMinutes(parseISO(date), 30)
    const oneHourAfter = addMinutes(parseISO(date), 30)

    if (isBefore(startingHour, new Date())) {
      throw new ErrorMessage(HTTP.BAD_REQUEST, 'Past dates are not allowed')
    }

    // Availability
    const existingAppointment = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: {
          [Op.between]: [oneHourBefore, oneHourAfter],
        },
      },
    })

    if (existingAppointment) {
      throw new ErrorMessage(
        HTTP.BAD_REQUEST,
        'The selected date is not available'
      )
    }

    // Creation
    const appointment = await Appointment.create({
      user_id,
      provider_id,
      date,
    })

    // Notify provider
    const user = await User.findByPk(user_id)

    await Notification.create({
      message: `New schedule with ${user.name} at ${format(
        startingHour,
        "Qo 'of' MMMM', at' hh:mm a"
      )}`,
      user: provider_id,
    })

    await Cache.invalidateByPrefix(`user:${user_id}:appointments`)

    return appointment
  }
}

export default new CreateAppointmentService()
