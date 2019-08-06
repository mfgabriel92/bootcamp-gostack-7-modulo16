import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns'
import { Op } from 'sequelize'
import Appointment from '../models/Appointment'
import hours from '../../utils/hours'

class AvailableHoursService {
  async run({ provider_id, date }) {
    const appointments = await Appointment.findAll({
      where: {
        provider_id,
        date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
        },
      },
    })

    const available = hours.map(hour => {
      const [h, m] = hour.split(':')
      const value = setSeconds(setMinutes(setHours(date, h), m), 0)

      return {
        hour,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === hour),
      }
    })

    return available
  }
}

export default new AvailableHoursService()
