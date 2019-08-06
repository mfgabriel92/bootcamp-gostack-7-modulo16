import { Router } from 'express'
import multer from 'multer'
import Brute from 'express-brute'
import multerConfig from './config/multer'
import bruteRedisConfig from './config/brute-redis'
import auth from './app/middlewares/auth'
import SessionController from './app/controllers/SessionController'
import UserController from './app/controllers/UserController'
import FileController from './app/controllers/FileController'
import ProviderController from './app/controllers/ProviderController'
import AvailableController from './app/controllers/AvailableController'
import AppointmentController from './app/controllers/AppointmentController'
import ScheduleController from './app/controllers/ScheduleController'
import NotificationController from './app/controllers/NotificationController'
import validSessionStore from './app/validators/SessionStore'
import validUserStore from './app/validators/UserStore'
import validUserUpdate from './app/validators/UserUpdate'
import validAptmntStore from './app/validators/AppointmentStore'

const routes = new Router()
const upload = multer(multerConfig).single('file')
const bruteForce = new Brute(bruteRedisConfig).prevent

routes.post('/api/auth', validSessionStore, bruteForce, SessionController.store)
routes.post('/api/users', validUserStore, UserController.store)

routes.use(auth)

routes.put('/api/users', validUserUpdate, UserController.update)
routes.put('/api/users/avatar', upload, FileController.store)

routes.get('/api/providers', ProviderController.index)
routes.get('/api/providers/:id/available', AvailableController.index)

routes.get('/api/schedules', ScheduleController.index)

routes.get('/api/appointments', AppointmentController.index)
routes.post('/api/appointments', validAptmntStore, AppointmentController.store)
routes.delete('/api/appointments/:id', AppointmentController.delete)

routes.get('/api/notifications', NotificationController.index)
routes.put('/api/notifications/:id', NotificationController.update)

export default routes
