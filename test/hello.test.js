jest.mock('@adobe/aio-sdk', () => ({
  Core: { Logger: jest.fn(() => ({ info: jest.fn(), debug: jest.fn(), error: jest.fn() })) }
}))
const { main } = require('../actions/hello/index.js')

const authHeaders = { __ow_headers: { authorization: 'Bearer fake-token' } }

describe('hello', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when the IMS token is missing', async () => {
    const res = await main({})
    expect(res.statusCode).toBe(401)
    expect(res.body.error).toContain('Missing IMS token')
  })

  it('returns 200 and greets the provided name', async () => {
    const res = await main({ ...authHeaders, name: 'Ada' })
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Hello, Ada!')
  })

  it('defaults to World when no name is given', async () => {
    const res = await main({ ...authHeaders })
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Hello, World!')
  })

  it('returns 500 when logging throws unexpectedly', async () => {
    const { Core } = require('@adobe/aio-sdk')
    Core.Logger.mockImplementationOnce(() => {
      throw new Error('boom')
    })
    const res = await main({ ...authHeaders, name: 'Ada' })
    expect(res.statusCode).toBe(500)
    expect(res.body.error).toBe('boom')
  })
})
