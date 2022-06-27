import { Request, Response, Router } from 'express'
import { findNewMovie } from '../controllers/SynoptixController'
import { TypedRequestBody } from '../models/Express'
import { Game } from '../models/Game'
import { compareWordWithCloud } from '../utils/vectorComparator'
const router = Router()

let currentGame: Game

router.get('/', async (req: Request, res: Response) => {
    try {
        res.send(currentGame.redactedGame())
    } catch (error) {
        res.status(500).send(error)
    }
})
router.get('/status', async (req: Request, res: Response) => {
    try {
        res.send(currentGame.redactedGame())
    } catch (error) {
        res.status(500).send(error)
    }
})
router.get('/backend/response', async (req: Request, res: Response) => {
    try {
        res.send(currentGame.title + currentGame.solutionPlainText)
    } catch (error) {
        res.status(500).send(error)
    }
})
router.get('/backend/:movie', async (req: Request, res: Response) => {
    try {
        const { movie } = req.params
        const { id, title, synopsis } = await findNewMovie(movie)
        if (!currentGame || currentGame.id !== id) {
            currentGame = new Game(id, title, synopsis)
        }
        res.send(currentGame)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post(
    '/score/',
    async (
        req: TypedRequestBody<{
            userID: string
            word: string
            wordIDs: string[]
        }>,
        res: Response
    ) => {
        const { userID, word, wordIDs } = req.body
        // console.log('score', userID, word)
        const { score, cache: updatedCache } = await compareWordWithCloud(
            word,
            currentGame.wordCloud,
            currentGame.cache
        )

        const scoreIDs = score
            .filter((word) => word.similarity === 1)
            .map((word) => word.id.toString())
        const candidateWordIDs: string[] = [
            ...wordIDs.map((id) => id.toString()),
            ...scoreIDs,
        ]
        const hasWon = currentGame.checkWinningCondition(
            userID,
            candidateWordIDs
        )
        currentGame.cache = updatedCache
        return res.send({
            score,
            foundBy: currentGame.foundBy,
            response: hasWon ? currentGame.solution : undefined,
        })
    }
)

export default router
