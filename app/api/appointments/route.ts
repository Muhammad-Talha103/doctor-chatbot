
import { NextResponse } from 'next/server'

const requiredFields = [
  'patient_name',
  'patient_email',
  'patient_phone',
  'patient_location',
  'disease_summary',
  'appointment_date',
  'appointment_time',
  'appointment_type',
] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required text fields
    if (
      requiredFields.some(
        (field) => typeof body[field] !== 'string' || !body[field].trim()
      )
    ) {
      return NextResponse.json(
        { error: 'Complete appointment details are required.' },
        { status: 400 }
      )
    }

    // Validate appointment type
    if (!['physical', 'online'].includes(body.appointment_type)) {
      return NextResponse.json(
        { error: 'Invalid appointment type.' },
        { status: 400 }
      )
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      return NextResponse.json(
        {
          error:
            'Appointment storage is not configured. Add Supabase variables to .env.local.',
        },
        { status: 503 }
      )
    }

    const appointmentData = {
      patient_name: body.patient_name.trim(),
      patient_email: body.patient_email.trim(),
      patient_phone: body.patient_phone.trim(),
      patient_location: body.patient_location.trim(),
      disease_summary: body.disease_summary.trim(),

      appointment_date: body.appointment_date.trim(),
      appointment_time: body.appointment_time.trim(),
      appointment_type: body.appointment_type.trim(),

      whatsapp_number:
        body.appointment_type === 'online' && typeof body.whatsapp_number === 'string'
          ? body.whatsapp_number.trim()
          : null,

      status: body.status || 'confirmed',
      payment_method:
        typeof body.payment_method === 'string'
          ? body.payment_method.trim()
          : null,

      payment_status: body.payment_status || 'pending',
    }

    const response = await fetch(`${url}/rest/v1/appointments`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(appointmentData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Supabase error:', errorText)

      return NextResponse.json(
        { error: 'Could not save the appointment.' },
        { status: 502 }
      )
    }

    const savedData = await response.json()

    return NextResponse.json({ ok: true, data: savedData })
  } catch (error) {
    console.error('Appointment error:', error)

    return NextResponse.json(
      { error: 'Invalid appointment request.' },
      { status: 400 }
    )
  }
}


// import { NextResponse } from 'next/server'

// const requiredFields = [
//   'patient_name',
//   'patient_email',
//   'patient_phone',
//   'patient_location',
//   'disease_summary',
//   'appointment_date',
//   'appointment_time',
//   'appointment_type',
// ] as const

// export async function POST(request: Request) {
//   try {
//     const body = await request.json()

//     // Validate required fields
//     if (
//       requiredFields.some(
//         (field) =>
//           typeof body[field] !== 'string' || !body[field].trim()
//       )
//     ) {
//       return NextResponse.json(
//         { error: 'Complete appointment details are required.' },
//         { status: 400 }
//       )
//     }

//     // Validate appointment type
//     if (!['physical', 'online'].includes(body.appointment_type)) {
//       return NextResponse.json(
//         { error: 'Invalid appointment type.' },
//         { status: 400 }
//       )
//     }

//     const url = process.env.NEXT_PUBLIC_SUPABASE_URL
//     const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

//     if (!url || !key) {
//       return NextResponse.json(
//         {
//           error:
//             'Appointment storage is not configured. Add Supabase variables to .env.local.',
//         },
//         { status: 503 }
//       )
//     }

//     const appointmentData = {
//       patient_name: body.patient_name.trim(),
//       patient_email: body.patient_email.trim(),
//       patient_phone: body.patient_phone.trim(),
//       patient_location: body.patient_location.trim(),
//       disease_summary: body.disease_summary.trim(),

//       appointment_date: body.appointment_date.trim(),
//       appointment_time: body.appointment_time.trim(),

//       appointment_type: body.appointment_type.trim(),

//       // Appointment status
//       status: 'confirmed',

//       // Payment details
//       payment_method:
//         typeof body.payment_method === 'string'
//           ? body.payment_method.trim()
//           : null,

//       payment_status: 'pending',
//     }

//     const response = await fetch(`${url}/rest/v1/appointments`, {
//       method: 'POST',

//       headers: {
//         apikey: key,
//         Authorization: `Bearer ${key}`,
//         'Content-Type': 'application/json',
//         Prefer: 'return=minimal',
//       },

//       body: JSON.stringify(appointmentData),
//     })

//     if (!response.ok) {
//       const errorText = await response.text()
//       console.error('Supabase error:', errorText)

//       return NextResponse.json(
//         { error: 'Could not save the appointment.' },
//         { status: 502 }
//       )
//     }

//     return NextResponse.json({ ok: true })
//   } catch (error) {
//     console.error('Appointment error:', error)

//     return NextResponse.json(
//       { error: 'Invalid appointment request.' },
//       { status: 400 }
//     )
//   }
// }