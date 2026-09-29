import React, { useState } from 'react'
import {
  Provider,
  defaultTheme,
  View,
  Flex,
  Heading,
  Content,
  TextField,
  Button,
  InlineAlert,
  Text
} from '@adobe/react-spectrum'
import actions from '../config.json'

export default function App({ runtime, ims }) {
  // Do NOT call runtime.done() here — index.js calls it in the ready handler
  const helloUrl = actions['hello'] // exact action name from app.config.yaml

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  async function sayHello() {
    setError('')
    setMessage('')

    if (!helloUrl) {
      // config.json is empty until deploy/preview fills it in
      setError('Action URL not available yet. Deploy the app or start the preview first.')
      return
    }

    setIsPending(true)
    try {
      const res = await fetch(helloUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ims.token}`,
          'x-gw-ims-org-id': ims.org
        },
        body: JSON.stringify({ name })
      })
      if (!res.ok) throw new Error(`Action failed: ${res.status}`)
      const data = await res.json()
      setMessage(data.message)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <View backgroundColor="blue-400" minHeight="100vh" padding="size-400">
        <Flex direction="column" gap="size-300" maxWidth="size-6000" marginX="auto">
          <Heading level={1}>Hello World</Heading>
          <Content>Enter a name and call your Adobe I/O Runtime action.</Content>

          <TextField
            label="Name"
            value={name}
            onChange={setName}
            width="100%"
            onKeyDown={(e) => e.key === 'Enter' && sayHello()}
          />

          <Flex>
            <Button variant="accent" onPress={sayHello} isPending={isPending}>
              Say Hello
            </Button>
          </Flex>

          {message && (
            <InlineAlert variant="positive">
              <Heading>Response</Heading>
              <Content><Text>{message}</Text></Content>
            </InlineAlert>
          )}

          {error && (
            <InlineAlert variant="negative">
              <Heading>Error</Heading>
              <Content>{error}</Content>
            </InlineAlert>
          )}
        </Flex>
      </View>
    </Provider>
  )
}
