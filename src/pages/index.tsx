
import { ContextProvider } from '@/components/context'
import { Form } from '@/components/form'

export default function Index() {
  return (
    <ContextProvider>
      <Form />
    </ContextProvider>
  )
}
