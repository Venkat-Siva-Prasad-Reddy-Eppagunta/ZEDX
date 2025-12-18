import { useAuth } from '@/hooks/useAuthStore';
import { useCards } from '@/hooks/useCardsStore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { create, LinkExit, LinkSuccess, open } from 'react-native-plaid-link-sdk';

const API_BASE_URL = 'http://Venkatas-MacBook-Air.local:5001/api';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddPaymentSourceModal({ visible, onClose }: Props) {
  const { user } = useAuth();
  const { addPaymentSource } = useCards();
  const [loading, setLoading] = useState(false);

  const createLinkToken = async () => {
    const res = await fetch(
      `${API_BASE_URL}/plaid/create-link-token?flow=bank`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await res.json();
    return data.link_token;
  };

  const exchangeBankToken = async (publicToken: string) => {
    const res = await fetch(
      `${API_BASE_URL}/plaid/exchange-bank-token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token: publicToken }),
      }
    );

    const fundingSourceData = await res.json();
    if (fundingSourceData.success) {
      return fundingSourceData;
    }

    if (!res.ok) {
      throw new Error('Bank linking failed');
    }
  };

  const handleAddBank = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const linkToken = await createLinkToken();

      create({ token: linkToken });

      open({
        onSuccess: async (success: LinkSuccess) => {
          try {
            const fundingSourceData = await exchangeBankToken(success.publicToken);
            const fundingSource = fundingSourceData.fundingSource;
            console.log('Funding Source Data:', fundingSource);

            // Await the addPaymentSource function to ensure it completes
            await addPaymentSource({
              funding_source_id: fundingSource.funding_source_id,
              name: fundingSource.name,
              type: fundingSource.type,
              status: fundingSource.status,
              last4: fundingSource.last4,
              id: fundingSource.id,
            });

            Alert.alert('Success', 'Bank account added');
            onClose();
          } catch (error) {
            Alert.alert('Error', 'Failed to add payment source');
            console.error(error);
          } finally {
            setLoading(false);
          }
        },
        onExit: (_exit: LinkExit) => {
          setLoading(false);
        },
      });
    } catch (err) {
      Alert.alert('Error', 'Unable to add bank account');
      console.error(err);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (visible) {
      setLoading(false); // Reset loading state when modal becomes visible
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Bank Account</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAddBank}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Connect Bank</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancel: {
    textAlign: 'center',
    color: '#888',
    marginTop: 16,
  },
});