import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/lib/dashboard'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await getDashboardData(user.id)
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('[DASHBOARD_GET]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}