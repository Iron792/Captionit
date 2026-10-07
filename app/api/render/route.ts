import {NextResponse} from 'next/server';
export async function POST(){const provider=process.env.RENDER_PROVIDER||'local';if(provider!=='local')return NextResponse.json({error:'Configure a render worker/provider adapter.'},{status:501});return NextResponse.json({status:'queued',message:'Render adapter ready. Connect this endpoint to an FFmpeg worker for production rendering.'})}
