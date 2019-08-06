import { isBefore, subHours } from 'date-fns'
import Appointment from '../models/Appointment'
import User from '../models/User'
import Queue from '../../lib/Queue'
import CancelationMail from '../jobs/CancelationMail'
import HTTP from '../../utils/httpResponse'
import ErrorMessage from './ErrorMessage'
import Cache from '../../lib/Cache'

class CancelAppointmentService {
  async run({ id, user_id }) {
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
      ],
    })

    if (!appointment) {
      throw new ErrorMessage(HTTP.NOT_FOUND, 'Appointment not found')
    }

    if (appointment.user_id !== user_id) {
      throw new ErrorMessage(
        HTTP.UNAUTHORIZED,
        'You do not have permission to delete this appointment'
      )
    }

    if (appointment.canceled_at) {
      throw new ErrorMessage(
        HTTP.UNAUTHORIZED,
        'The appointment has already been canceled'
      )
    }

    const dateSubbed = subHours(appointment.date, 2)

    if (isBefore(dateSubbed, new Date())) {
      throw new ErrorMessage(
        HTTP.UNAUTHORIZED,
        'You cannot cancel an appointment less than 2 hours from its scheduled time'
      )
    }

    appointment.canceled_at = new Date()

    await appointment.save()
    await Queue.createJob(CancelationMail.key, { appointment })
    await Cache.invalidateByPrefix(`user:${user_id}:appointments`)

    return appointment
  }
}

export default new CancelAppointmentService()
