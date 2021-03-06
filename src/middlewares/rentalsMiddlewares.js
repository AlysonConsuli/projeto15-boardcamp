import db from "../db.js"
import { rentalsSchema } from "../schemas/rentalsSchema.js"

export const rentalsMiddleware = async (req, res, next) => {
    const { customerId, gameId, daysRented } = req.body
    const validation = rentalsSchema.validate({ daysRented }, { abortEarly: false })
    if (validation.error) {
        return res.sendStatus(400)
    }
    try {
        const customer = await db.query('SELECT id FROM customers WHERE id = $1', [customerId])
        if (!customer) {
            return res.sendStatus(400)
        }
        const game = await db.query('SELECT id FROM games WHERE id = $1', [gameId])
        if (!game) {
            return res.sendStatus(400)
        }
        const rentals = await db.query(`
        SELECT rentals.id, games."stockTotal" FROM rentals
        JOIN games ON games.id = $1
        WHERE rentals."gameId" = $1 AND rentals."returnDate" IS NULL`, [gameId])
        if (rentals.rows[0]?.stockTotal <= rentals.rows?.length) {
            return res.sendStatus(400)
        }
        next()
    } catch {
        res.sendStatus(500);
    }
}

export const returnRentMiddleware = async (req, res, next) => {
    const { id } = req.params
    try {
        const rent = await db.query('SELECT id, "returnDate" FROM rentals WHERE id = $1', [id])
        if (!rent.rows[0]?.id) {
            return res.sendStatus(404)
        }
        if (rent.rows[0]?.returnDate) {
            return res.sendStatus(400)
        }
        next()
    } catch {
        res.sendStatus(500);
    }
}

export const deleteRentMiddleware = async (req, res, next) => {
    const { id } = req.params
    try {
        const rent = await db.query('SELECT id, "returnDate" FROM rentals WHERE id = $1', [id])
        if (!rent.rows[0]?.id) {
            return res.sendStatus(404)
        }
        if (!rent.rows[0]?.returnDate) {
            return res.sendStatus(400)
        }
        next()
    } catch {
        res.sendStatus(500);
    }
}