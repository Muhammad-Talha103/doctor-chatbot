import { NextResponse } from 'next/server'
import { SYSTEM_PROMPT } from '../../../systemprompt'

// Interfaces for Strict TypeScript Typing
interface ChatMessage {
  role: string
  content: string
}

interface FormattedChatMessage {
  role: 'CHATBOT' | 'USER'
  message: string
}

interface RequestBodyPayload {
  messages?: ChatMessage[]
}

interface BookingData {
  patient_name?: string
  patient_email?: string
  patient_phone?: string
  patient_location?: string
  disease_summary?: string
  appointment_date?: string
  appointment_time?: string
  appointment_type?: string
  whatsapp_number?: string | null
  status?: string
  payment_method?: string | null
  payment_status?: string
}

interface SupabaseAppointmentPayload {
  patient_name: string
  patient_email: string
  patient_phone: string
  patient_location: string
  disease_summary: string
  appointment_date: string
  appointment_time: string
  appointment_type: 'physical' | 'online'
  whatsapp_number: string | null
  status: string
  payment_method: string | null
  payment_status: string
}

interface CohereResponseData {
  text?: string
  message?: string
}

interface SupabaseBookedSlot {
  appointment_date: string
  appointment_time: string
  status: string
}

// Dynamic 30-Day Calendar Context Generator
function getDynamicCalendarContext(): string {
  const now = new Date()

  const formatDate = (date: Date): string => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const today = new Date(now)
  const tomorrow = new Date(now)
  tomorrow.setDate(today.getDate() + 1)

  const upcoming30DaysList: string[] = []
  for (let i = 0; i < 30; i++) {
    const nextDate = new Date(now)
    nextDate.setDate(today.getDate() + i)
    const dayName = getDayName(nextDate)
    const formattedDate = formatDate(nextDate)

    if (i === 0) {
      upcoming30DaysList.push(`- TODAY (${dayName}): ${formattedDate}`)
    } else if (i === 1) {
      upcoming30DaysList.push(`- TOMORROW (${dayName}): ${formattedDate}`)
    } else {
      upcoming30DaysList.push(`- ${dayName}: ${formattedDate}`)
    }
  }

  return `
==================================================
DYNAMIC 30-DAY REAL-TIME CALENDAR CONTEXT (STRICT REFERENCE)
==================================================
* Current System Timestamp: ${now.toISOString()}
* TODAY: ${getDayName(today)}, ${formatDate(today)}
* TOMORROW: ${getDayName(tomorrow)}, ${formatDate(tomorrow)}

UPCOMING 30 DAYS REFERENCE TABLE (STRICTLY LOOKUP AND USE THESE DATES):
${upcoming30DaysList.join('\n')}

CRITICAL DATE RULES:
1. Whenever the user mentions relative expressions like "upcoming Tuesday", "next week Thursday", "tomorrow", or any day within the next 30 days, ALWAYS lookup the EXACT YYYY-MM-DD date from the 30-day reference list above.
2. DO NOT calculate, guess, or invent dates on your own.
==================================================
`
}

// Universal Global Timezone Converter
function getGlobalTimezoneContext(userLocationInput?: string): string {
  const nySlots: string[] = [
    '05:00 PM',
    '05:30 PM',
    '06:00 PM',
    '06:30 PM',
    '07:00 PM',
    '07:30 PM',
    '08:00 PM',
    '08:30 PM',
  ]

  const todayStr = new Date().toISOString().split('T')[0]

  const timeZoneMap: Record<string, string> = {
    usa: 'America/New_York',
    us: 'America/New_York',
    'united states': 'America/New_York',
    'new york': 'America/New_York',
    pakistan: 'Asia/Karachi',
    pk: 'Asia/Karachi',
    china: 'Asia/Shanghai',
    southafrica: 'Africa/Johannesburg',
    'south africa': 'Africa/Johannesburg',
    india: 'Asia/Kolkata',
    uk: 'Europe/London',
    'united kingdom': 'Europe/London',
    london: 'Europe/London',
    uae: 'Asia/Dubai',
    dubai: 'Asia/Dubai',
    saudi: 'Asia/Riyadh',
    'saudi arabia': 'Asia/Riyadh',
    canada: 'America/Toronto',
    australia: 'Australia/Sydney',
    germany: 'Europe/Berlin',
    japan: 'Asia/Tokyo',
  }

  // DEFAULT TIME ZONE: USA
  let targetTimeZone = 'America/New_York'

  if (userLocationInput) {
    const locLower = userLocationInput.toLowerCase()
    for (const [key, tz] of Object.entries(timeZoneMap)) {
      if (locLower.includes(key)) {
        targetTimeZone = tz
        break
      }
    }
  }

  const convertedSlots: string[] = nySlots.map((slot: string) => {
    const [timeStr, modifier] = slot.split(' ')
    const parts = timeStr.split(':')
    let hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1], 10)

    if (modifier === 'PM' && hours < 12) hours += 12
    if (modifier === 'AM' && hours === 12) hours = 0

    const nyDate = new Date(`${todayStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00-04:00`)

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimeZone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      weekday: 'short',
    })

    const formattedUserTime = formatter.format(nyDate)
    return `- ${slot} EST/EDT = ${formattedUserTime} (${targetTimeZone.split('/')[1] || targetTimeZone})`
  })

  return `
==================================================
DYNAMIC GLOBAL TIME CONVERSION REFERENCE
==================================================
Clinic Available Slots (New York EST/EDT) converted to Target Location (${targetTimeZone}):
${convertedSlots.join('\n')}

CRITICAL TIMEZONE RULE:
1. Default Timezone is USA (New York EST/EDT).
2. When a user asks for times in their specific local time zone (Pakistan, China, South Africa, UK, UAE, etc.), present the exact pre-calculated converted times listed above.
3. Always mention BOTH: The New York EST time and the converted User Local Time when providing converted slots.
==================================================
`
}

export async function POST(request: Request) {


  try {
    const body: RequestBodyPayload | null = await request.json().catch((err: unknown) => {
      console.error('❌ Error parsing JSON request body:', err)
      return null
    })

    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON payload received.' },
        { status: 400 }
      )
    }

    const { messages } = body
    const apiKey = process.env.COHERE_API_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service key is missing. Add COHERE_API_KEY to .env.local.' },
        { status: 503 }
      )
    }

    const rawMessages: ChatMessage[] = Array.isArray(messages) ? messages : []

    const formattedHistory: FormattedChatMessage[] = rawMessages
      .filter((msg: ChatMessage) => msg && msg.content && String(msg.content).trim() !== '')
      .map((msg: ChatMessage) => ({
        role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
        message: String(msg.content).slice(0, 4000),
      }))

    if (formattedHistory.length === 0) {
      return NextResponse.json(
        { error: 'Messages array cannot be empty.' },
        { status: 400 }
      )
    }

    const calendarContext = getDynamicCalendarContext()

    const lastUserMsg = formattedHistory.pop()
    const chatHistory = formattedHistory

    const fullConversationText = [...chatHistory.map((m: FormattedChatMessage) => m.message), lastUserMsg?.message || ''].join(' ')
    const timeZoneContext = getGlobalTimezoneContext(fullConversationText)

    let existingAppointmentsContext = ''
    if (supabaseUrl && supabaseKey) {
      try {
        const fetchRes = await fetch(
          `${supabaseUrl}/rest/v1/appointments?select=appointment_date,appointment_time,status&status=eq.confirmed`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        )
        if (fetchRes.ok) {
          const bookedSlots: SupabaseBookedSlot[] = await fetchRes.json()
          if (bookedSlots && bookedSlots.length > 0) {
            existingAppointmentsContext = `\n\nALREADY BOOKED APPOINTMENTS IN DATABASE (STRICTLY DO NOT BOOK THESE SLOTS):\n${JSON.stringify(
              bookedSlots
            )}`
          }
        }
      } catch (err: unknown) {
        console.warn('⚠️ Could not fetch existing appointments for slot context:', err)
      }
    }

    const ENHANCED_PROMPT = `${calendarContext}\n\n${timeZoneContext}\n\n${SYSTEM_PROMPT}${existingAppointmentsContext}

CRITICAL INSTRUCTION FOR APPOINTMENTS:
Whenever the user confirms all details for an appointment:
1. FIRST, provide a warm, professional, and visually clear summary card in plain Markdown text for the user to review.
2. DO NOT output raw JSON to the user as your main response.
3. At the VERY END of your response, append the exact JSON block inside triple backticks using the tag 'json_booking'.

Required JSON structure:
\`\`\`json_booking
{
  "patient_name": "Full Name",
  "patient_email": "patient@example.com",
  "patient_phone": "+1234567890",
  "patient_location": "City, Country",
  "disease_summary": "Symptoms or reason",
  "appointment_date": "YYYY-MM-DD",
  "appointment_time": "05:00 PM",
  "appointment_type": "online",
  "whatsapp_number": "+1234567890",
  "payment_method": null,
  "payment_status": "pending",
  "status": "confirmed"
}
\`\`\``

    const modelsToTry: string[] = ['command-r-08-2024', 'command-r-plus-08-2024']
    let responseText: string | null = null
    let lastError: string | null = null

    for (const modelName of modelsToTry) {
      const res = await fetch('https://api.cohere.com/v1/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          message: lastUserMsg?.message || '',
          chat_history: chatHistory,
          preamble: ENHANCED_PROMPT,
          temperature: 0.1,
        }),
      })

      const data: CohereResponseData = await res.json()

      if (res.ok && data?.text) {
        responseText = data.text
        break
      } else {
        lastError = data?.message || `HTTP ${res.status}`
      }
    }

    if (!responseText) {
      throw new Error(lastError || 'All Cohere AI models failed to respond.')
    }

    const jsonMatch =
      responseText.match(/```json_booking\s*([\s\S]*?)\s*```/) ||
      responseText.match(/```booking_json\s*([\s\S]*?)\s*```/) ||
      responseText.match(/```json\s*([\s\S]*?)\s*```/)

    if (jsonMatch && jsonMatch[1]) {
      let bookingData: BookingData | null = null
      try {
        bookingData = JSON.parse(jsonMatch[1].trim()) as BookingData

        if (supabaseUrl && supabaseKey && bookingData) {
          const payload: SupabaseAppointmentPayload = {
            patient_name: bookingData.patient_name || 'N/A',
            patient_email: bookingData.patient_email || 'N/A',
            patient_phone: bookingData.patient_phone || 'N/A',
            patient_location: bookingData.patient_location || 'N/A',
            disease_summary: bookingData.disease_summary || 'Consultation',
            appointment_date: bookingData.appointment_date || 'N/A',
            appointment_time: bookingData.appointment_time || 'N/A',
            appointment_type: ['physical', 'online'].includes(
              String(bookingData.appointment_type).toLowerCase()
            )
              ? (String(bookingData.appointment_type).toLowerCase() as 'physical' | 'online')
              : 'physical',
            whatsapp_number: bookingData.whatsapp_number || null,
            status: bookingData.status || 'confirmed',
            payment_method: bookingData.payment_method || null,
            payment_status: bookingData.payment_status || 'pending',
          }

          // 🛡️ DUPLICATE CHECK: Verify if this exact appointment was inserted in Supabase within last few seconds
          const checkExistingRes = await fetch(
            `${supabaseUrl}/rest/v1/appointments?patient_email=eq.${encodeURIComponent(
              payload.patient_email
            )}&appointment_date=eq.${encodeURIComponent(
              payload.appointment_date
            )}&appointment_time=eq.${encodeURIComponent(payload.appointment_time)}`,
            {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            }
          )

          const existingRecords: SupabaseAppointmentPayload[] = checkExistingRes.ok
            ? await checkExistingRes.json()
            : []

          // Only Insert if record does not already exist
          if (existingRecords.length === 0) {
            const dbRes = await fetch(`${supabaseUrl}/rest/v1/appointments`, {
              method: 'POST',
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation',
              },
              body: JSON.stringify(payload),
            })

            if (dbRes.ok) {
              console.log('🎉 SUCCESS!')
            } else {
              console.error('❌ SUPABASE INSERT ERROR:', await dbRes.text())
            }
          } else {
            console.warn('⚠️ DUPLICATE PREVENTED: Appointment already exists in Supabase.')
          }
        }
      } catch (parseErr: unknown) {
        const errorMsg = parseErr instanceof Error ? parseErr.message : 'Unknown JSON parse error'
        console.error('❌ JSON Parsing Error:', errorMsg)
      }

      let cleanedText = responseText
        .replace(/```json_booking\s*[\s\S]*?\s*```/g, '')
        .replace(/```booking_json\s*[\s\S]*?\s*```/g, '')
        .replace(/```json\s*[\s\S]*?\s*```/g, '')
        .trim()

      if (!cleanedText || cleanedText.length < 25) {
        cleanedText =
          `🎉 **Appointment Confirmed!**\n\n` +
          `Your appointment has been successfully booked with the following details:\n\n` +
          `* **Patient Name:** ${bookingData?.patient_name || 'N/A'}\n` +
          `* **Email:** ${bookingData?.patient_email || 'N/A'}\n` +
          `* **Phone:** ${bookingData?.patient_phone || 'N/A'}\n` +
          `* **Date & Time:** ${bookingData?.appointment_date || 'N/A'} at ${bookingData?.appointment_time || 'N/A'}\n` +
          `* **Type:** ${bookingData?.appointment_type ? String(bookingData.appointment_type).toUpperCase() : 'N/A'}\n` +
          `* **Location:** ${bookingData?.patient_location || 'N/A'}\n` +
          `* **Reason:** ${bookingData?.disease_summary || 'N/A'}\n\n` +
          `We look forward to assisting you!`
      }

      responseText = cleanedText
    }

    return NextResponse.json({ text: responseText })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unable to process chat request.'
    console.error('❌ [API Catch Error]:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


// import { NextResponse } from 'next/server'
// import { SYSTEM_PROMPT } from '../../../systemprompt'

// export async function POST(request: Request) {
//   console.log('\n==================================================')
//   console.log('🚀 [API Route /api/chat] NEW CHAT REQUEST RECEIVED')
//   console.log('==================================================')

//   try {
//     const body = await request.json().catch((err) => {
//       console.error('❌ Error parsing JSON request body:', err)
//       return null
//     })

//     if (!body) {
//       console.error('❌ Invalid JSON Payload')
//       return NextResponse.json(
//         { error: 'Invalid JSON payload received.' },
//         { status: 400 }
//       )
//     }

//     const { messages } = body
//     const apiKey = process.env.COHERE_API_KEY

//     if (!apiKey) {
//       console.error('❌ CRITICAL: COHERE_API_KEY is missing in process.env / .env.local')
//       return NextResponse.json(
//         { error: 'AI service key is missing. Add COHERE_API_KEY to .env.local.' },
//         { status: 503 }
//       )
//     }

//     const rawMessages = Array.isArray(messages) ? messages : []

//     const formattedHistory = rawMessages
//       .filter((msg) => msg && msg.content && String(msg.content).trim() !== '')
//       .map((msg: { role: string; content: string }) => ({
//         role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
//         message: String(msg.content).slice(0, 4000),
//       }))

//     if (formattedHistory.length === 0) {
//       console.error('⚠️ Formatted message history is empty!')
//       return NextResponse.json(
//         { error: 'Messages array cannot be empty.' },
//         { status: 400 }
//       )
//     }

//     const lastUserMsg = formattedHistory.pop()
//     const chatHistory = formattedHistory

//     console.log(`📩 Last User Message: "${lastUserMsg?.message}"`)
//     console.log(`📜 Chat History Length: ${chatHistory.length} messages`)

//     // Enhanced System Prompt forcing JSON payload for bookings
//     const ENHANCED_PROMPT = `${SYSTEM_PROMPT}

// CRITICAL SYSTEM INSTRUCTION FOR APPOINTMENTS:
// Whenever the user wants to finalize/confirm an appointment and has provided required details (Name, Email, Phone, Location, Disease/Reason, Date, Time, Physical/Online type), you MUST include a raw JSON block at the VERY END of your response inside triple backticks with tag 'booking_json'.

// Format required EXACTLY:
// \`\`\`booking_json
// {
//   "patient_name": "User Full Name",
//   "patient_email": "user@email.com",
//   "patient_phone": "03001234567",
//   "patient_location": "User Location",
//   "disease_summary": "Symptoms or reason",
//   "appointment_date": "YYYY-MM-DD",
//   "appointment_time": "10:00 AM",
//   "appointment_type": "physical",
//   "payment_method": "Cash"
// }
// \`\`\``

//     const modelsToTry = ['command-r-08-2024', 'command-r-plus-08-2024']
//     let responseText: string | null = null
//     let lastError: string | null = null

//     for (const modelName of modelsToTry) {
//       console.log(`📡 Sending request to Cohere Model: [${modelName}]...`)

//       const res = await fetch('https://api.cohere.com/v1/chat', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${apiKey.trim()}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           model: modelName,
//           message: lastUserMsg?.message || '',
//           chat_history: chatHistory,
//           preamble: ENHANCED_PROMPT,
//           temperature: 0.1, // Low temp for reliable JSON extraction
//         }),
//       })

//       const data = await res.json()

//       if (res.ok && data?.text) {
//         responseText = data.text
//         console.log(`✅ AI Response Received from [${modelName}]!`)
//         break
//       } else {
//         console.warn(`⚠️ Model [${modelName}] failed. Error:`, data?.message || data)
//         lastError = data?.message || `HTTP ${res.status}`
//       }
//     }

//     if (!responseText) {
//       throw new Error(lastError || 'All Cohere AI models failed to respond.')
//     }

//     console.log('\n--- 🔍 INSPECTING AI OUTPUT FOR BOOKING DATA ---')
//     console.log('RAW AI RESPONSE TEXT:\n', responseText)

//     // Regex extraction for ```booking_json ... ``` OR ```json ... ```
//     const jsonMatch = 
//       responseText.match(/```booking_json\s*([\s\S]*?)\s*```/) ||
//       responseText.match(/```json\s*([\s\S]*?)\s*```/)

//     if (jsonMatch && jsonMatch[1]) {
//       console.log('💡 Found Booking JSON block in AI response!')
//       console.log('EXTRACTED JSON STRING:\n', jsonMatch[1])

//       try {
//         const bookingData = JSON.parse(jsonMatch[1].trim())
//         console.log('✅ Parsed Booking Object Successfully:\n', JSON.stringify(bookingData, null, 2))

//         const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
//         const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

//         console.log('\n--- 🗄️ CONNECTING TO SUPABASE DATABASE ---')
//         console.log(`Supabase URL Configured: ${supabaseUrl ? 'YES ✅' : 'NO ❌'}`)
//         console.log(`Supabase Anon Key Configured: ${supabaseKey ? 'YES ✅' : 'NO ❌'}`)

//         if (!supabaseUrl || !supabaseKey) {
//           console.error('❌ ERROR: Supabase environment variables missing in process.env!')
//         } else {
//           const payload = {
//             patient_name: bookingData.patient_name || 'N/A',
//             patient_email: bookingData.patient_email || 'N/A',
//             patient_phone: bookingData.patient_phone || 'N/A',
//             patient_location: bookingData.patient_location || 'N/A',
//             disease_summary: bookingData.disease_summary || 'Consultation',
//             appointment_date: bookingData.appointment_date || 'N/A',
//             appointment_time: bookingData.appointment_time || 'N/A',
//             appointment_type: ['physical', 'online'].includes(String(bookingData.appointment_type).toLowerCase())
//               ? String(bookingData.appointment_type).toLowerCase()
//               : 'physical',
//             status: 'confirmed',
//             payment_method: bookingData.payment_method || 'Cash',
//             payment_status: 'pending',
//           }

//           console.log('📤 Sending POST request to Supabase Table: appointments')
//           console.log('PAYLOAD:\n', JSON.stringify(payload, null, 2))

//           const dbRes = await fetch(`${supabaseUrl}/rest/v1/appointments`, {
//             method: 'POST',
//             headers: {
//               'apikey': supabaseKey,
//               'Authorization': `Bearer ${supabaseKey}`,
//               'Content-Type': 'application/json',
//               'Prefer': 'return=representation', // Returns created row or detailed error
//             },
//             body: JSON.stringify(payload),
//           })

//           const dbStatus = dbRes.status
//           const dbResponseBody = await dbRes.text()

//           console.log(`📥 Supabase Response HTTP Status Code: ${dbStatus}`)

//           if (dbRes.ok) {
//             console.log('🎉 SUCCESS! Appointment record created in Supabase Table!')
//             console.log('RECORD DETAILS:\n', dbResponseBody)
//           } else {
//             console.error('❌ SUPABASE INSERT FAILED!')
//             console.error('ERROR RESPONSE BODY FROM SUPABASE:\n', dbResponseBody)
//           }
//         }
//       } catch (parseErr: any) {
//         console.error('❌ JSON Parsing Error on Extracted Block:', parseErr?.message)
//       }

//       // Clean the JSON code block from final user text
//       responseText = responseText
//         .replace(/```booking_json\s*[\s\S]*?\s*```/g, '')
//         .replace(/```json\s*[\s\S]*?\s*```/g, '')
//         .trim()
//     } else {
//       console.log('ℹ️ No booking JSON block was output by AI in this message.')
//     }

//     console.log('==================================================\n')
//     return NextResponse.json({ text: responseText })

//   } catch (error: any) {
//     console.error('❌ [API Catch Block Error]:', error?.message || error)
//     return NextResponse.json(
//       { error: error?.message || 'Unable to process chat request.' },
//       { status: 500 }
//     )
//   }
// }