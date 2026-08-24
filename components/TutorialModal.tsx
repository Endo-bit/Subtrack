import { X } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { TutorialSlides } from '@/components/TutorialSlides';
import { useSubTrack } from '@/context/SubTrackContext';

type Props = { visible: boolean; onClose: () => void };

/** Lets the user revisit the onboarding tutorial anytime from Settings. */
export function TutorialModal({ visible, onClose }: Props) {
  const { t } = useSubTrack();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <TutorialSlides onDone={onClose} />
      <Pressable
        style={styles.closeBtn}
        onPress={onClose}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t.cancel}
      >
        <X size={22} color="#FFFFFF" />
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
