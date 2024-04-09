import { z } from 'zod';
import type { APIRoute } from "astro";
import { DEFAULT_LOCALE_STRING } from '../../consts.ts';

const ContactFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
  date: z.string(),
});

const CreateContact = ContactFormSchema.omit({ id: true, date: true });

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  const result = CreateContact.safeParse({
    name: data.get('name'),
    email: data.get('email'),
    message: data.get('message'),
  });

if(!result.success) {
  return new Response(
    JSON.stringify({
      message: "Invalid data",
      errors: result.error.errors
    }),
    { status: 400 }
  );
}


  // todo: send to firebase
  const date = new Date().toLocaleString(DEFAULT_LOCALE_STRING)
  const id= crypto.randomUUID();

  return new Response(
    JSON.stringify({
      message: "Success!"
    }),
    { status: 200 }
  );
}