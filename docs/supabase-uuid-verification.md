# Supabase UUID Verification with Expo React Native

This guide explains how to implement UUID verification in your Expo React Native application using Supabase.

## Prerequisites

- Expo CLI
- Supabase account
- React Native development environment

## Installation

```bash
# Install required dependencies
npx expo install @supabase/supabase-js
npx expo install react-native-url-polyfill
npx expo install @react-native-async-storage/async-storage
```

## Configuration

1. Create a Supabase client configuration file (`lib/supabase.ts`):

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## UUID Verification Implementation

### Basic Verification

```typescript
// utils/uuidVerification.ts
import { supabase } from '../lib/supabase';

export const verifyUUID = async (uuid: string) => {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      return {
        isValid: false,
        error: 'Invalid UUID format'
      };
    }

    // Check UUID in database
    const { data, error } = await supabase
      .from('your_table')
      .select('id')
      .eq('id', uuid)
      .single();

    if (error) {
      return {
        isValid: false,
        error: error.message
      };
    }

    return {
      isValid: !!data,
      data
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Verification failed'
    };
  }
};
```

### Advanced Verification

```typescript
// utils/advancedUUIDVerification.ts
interface VerificationOptions {
  checkExpiry?: boolean;
  checkStatus?: boolean;
  additionalFields?: string[];
}

export const advancedUUIDVerification = async (
  uuid: string,
  options: VerificationOptions = {}
) => {
  try {
    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      return {
        isValid: false,
        error: 'Invalid UUID format'
      };
    }

    // Build and execute query
    let query = supabase
      .from('your_table')
      .select('id, created_at, status, ...additionalFields');

    if (options.additionalFields) {
      query = query.select(options.additionalFields.join(', '));
    }

    const { data, error } = await query
      .eq('id', uuid)
      .single();

    if (error) {
      return {
        isValid: false,
        error: error.message
      };
    }

    // Additional checks
    if (options.checkExpiry && data.expires_at) {
      const isExpired = new Date(data.expires_at) < new Date();
      if (isExpired) {
        return {
          isValid: false,
          error: 'UUID has expired'
        };
      }
    }

    if (options.checkStatus && data.status !== 'active') {
      return {
        isValid: false,
        error: `Invalid status: ${data.status}`
      };
    }

    return {
      isValid: true,
      data
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Verification failed'
    };
  }
};
```

### Real-time Verification

```typescript
// utils/realtimeUUIDVerification.ts
export const subscribeToUUIDChanges = (uuid: string, callback: (status: any) => void) => {
  const subscription = supabase
    .channel(`uuid-${uuid}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'your_table',
      filter: `id=eq.${uuid}`
    }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
```

## Usage Example

```typescript
// components/UUIDVerification.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { verifyUUID } from '../utils/uuidVerification';

export const UUIDVerification = () => {
  const [uuid, setUuid] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<{
    isValid?: boolean;
    error?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = async () => {
    setIsLoading(true);
    try {
      const result = await verifyUUID(uuid);
      setVerificationStatus(result);
    } catch (error) {
      setVerificationStatus({
        isValid: false,
        error: 'Verification failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={uuid}
        onChangeText={setUuid}
        placeholder="Enter UUID"
        autoCapitalize="none"
      />
      <Button
        title={isLoading ? "Verifying..." : "Verify UUID"}
        onPress={handleVerification}
        disabled={isLoading}
      />
      {verificationStatus.isValid !== undefined && (
        <Text style={[
          styles.status,
          verificationStatus.isValid ? styles.success : styles.error
        ]}>
          {verificationStatus.isValid 
            ? "UUID is valid" 
            : `Error: ${verificationStatus.error}`}
        </Text>
      )}
    </View>
  );
};
```

## Best Practices

1. **Security**
   - Validate UUIDs on both client and server side
   - Implement rate limiting
   - Use proper error handling
   - Consider adding verification tokens

2. **Performance**
   - Cache verification results
   - Implement loading states
   - Add retry logic for failed verifications

3. **User Experience**
   - Provide clear feedback
   - Show loading indicators
   - Implement proper error messages
   - Consider auto-verification

4. **Error Handling**
   - Handle network errors
   - Handle invalid UUID formats
   - Handle expired UUIDs
   - Handle revoked UUIDs

## Environment Variables

Create an `app.config.js`:

```javascript
export default {
  expo: {
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
```

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 