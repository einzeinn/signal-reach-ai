import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Debug endpoint to test Bright Data connection
 * Try: GET /api/test-brightdata
 */
export async function GET(request: NextRequest) {
  try {
    const token = process.env.BRIGHTDATA_API_TOKEN;
    const linkedinDataset = process.env.BRIGHTDATA_DATASET_LINKEDIN;
    const redditDataset = process.env.BRIGHTDATA_DATASET_REDDIT;
    const newsDataset = process.env.BRIGHTDATA_DATASET_NEWS;

    console.log('[Test Bright Data]', {
      token: token ? `***${token.slice(-10)}` : 'NOT SET',
      linkedinDataset: linkedinDataset || 'NOT SET',
      redditDataset: redditDataset || 'NOT SET',
      newsDataset: newsDataset || 'NOT SET',
    });

    // Test 1: Check if credentials exist
    if (!token) {
      return NextResponse.json({
        status: 'error',
        message: 'BRIGHTDATA_API_TOKEN is not set in environment variables',
        debug: {
          token: 'MISSING',
          linkedinDataset,
          redditDataset,
          newsDataset,
        }
      }, { status: 400 });
    }

    if (!linkedinDataset || !redditDataset || !newsDataset) {
      return NextResponse.json({
        status: 'error',
        message: 'One or more dataset IDs are missing',
        debug: {
          token: `***${token.slice(-10)}`,
          linkedinDataset: linkedinDataset || 'MISSING',
          redditDataset: redditDataset || 'MISSING',
          newsDataset: newsDataset || 'MISSING',
        }
      }, { status: 400 });
    }

    // Test 2: Try to trigger a LinkedIn scrape
    console.log('[Test Bright Data] Attempting trigger with dataset:', linkedinDataset);
    
    const triggerResponse = await fetch(
      `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${linkedinDataset}&include_errors=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            url: `https://www.linkedin.com/jobs/search/?keywords=software%20engineer`
          }
        ]),
      }
    );

    console.log('[Test Bright Data] Trigger response status:', triggerResponse.status);

    const triggerData = await triggerResponse.json();
    console.log('[Test Bright Data] Trigger response:', triggerData);

    if (!triggerResponse.ok) {
      return NextResponse.json({
        status: 'error',
        message: `Bright Data trigger failed with status ${triggerResponse.status}`,
        debug: {
          status: triggerResponse.status,
          response: triggerData,
          request: {
            url: `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${linkedinDataset}`,
            method: 'POST',
            body: [{ url: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer' }]
          }
        }
      }, { status: triggerResponse.status });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Bright Data connection successful!',
      debug: {
        token: `***${token.slice(-10)}`,
        linkedinDataset,
        snapshotId: triggerData.snapshot_id,
        triggerResponse: triggerData,
      }
    });

  } catch (error) {
    console.error('[Test Bright Data] Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      }
    }, { status: 500 });
  }
}
