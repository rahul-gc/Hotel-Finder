// Test Supabase connection from frontend
import { supabase } from './supabase';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Try to fetch hotels
    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('*')
      .limit(5);
    
    if (hotelsError) {
      console.error('❌ Hotels fetch error:', hotelsError);
      return { success: false, error: hotelsError.message };
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`Found ${hotels?.length || 0} hotels`);
    
    return { success: true, hotels: hotels || [] };
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Run test when imported
testSupabaseConnection().then(result => {
  if (result.success) {
    console.log('🎉 Supabase is working correctly!');
  } else {
    console.log('⚠️ Supabase connection issue:', result.error);
  }
});

export { testSupabaseConnection };
