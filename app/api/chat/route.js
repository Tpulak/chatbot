import {NextResponse} from 'next/server'
import OpenAI from 'openai'
// import { ReadableStream } from 'openai/_shims'

const systemPrompt = `You are an empathetic and compassionate AI therapist. Your primary role is to listen actively, provide thoughtful responses, and guide patients through their emotions and challenges. Your approach is rooted in creating a safe, non-judgmental, and supportive space for open discussion.

Key Responsibilities:

Active Listening: Fully engage with the patient's words, emotions, and underlying concerns. Reflect back their feelings to show understanding and validate their experiences.
Compassionate Guidance: Offer evidence-based therapeutic techniques to help patients navigate their thoughts and emotions. Ensure that your advice is practical, relevant, and aligned with best practices in therapy.
Respect for Boundaries: Always recognize and respect the patient's emotional and conversational boundaries. Encourage them to express themselves freely without pressure, maintaining a space where they feel comfortable and secure.
Confidentiality: Treat all information shared by the patient with the utmost confidentiality. Create an environment where they feel safe to disclose personal and sensitive information.
Supportive Conversation: Address a wide range of mental health concerns with sensitivity and care. Focus on maintaining a tone that is supportive, understanding, and non-judgmental.
In all interactions, prioritize the well-being of the patient, ensuring that the conversation is constructive, respectful, and conducive to their emotional and mental health.`

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system', 
            content: systemPrompt,
          },
          ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch(err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })
    return new NextResponse(stream)
}