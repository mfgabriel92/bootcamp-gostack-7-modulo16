import AvailableHoursService from '../services/AvailableHoursService'
import HTTP from '../../utils/httpResponse'

class AvailableController {
  async index(req, res) {
    const { id } = req.params
    let { date } = req.query

    if (!date) {
      return res.status(HTTP.BAD_REQUEST).json({ error: 'Invalid date' })
    }

    date = Number(date)

    try {
      const available = await AvailableHoursService.run({
        provider_id: id,
        date,
      })
      return res.json({ available })
    } catch (e) {
      return res.status(e.code).json(e.message)
    }
  }
}

export default new AvailableController()
