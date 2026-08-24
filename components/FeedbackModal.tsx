import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '@/constants/theme';
import { track } from '@/utils/analytics';

const SUPPORT_EMAIL = 'cutedogstoryai@gmail.com';

const EMOJIS = ['😤', '😕', '😐', '🙂', '🤩'];

type Props = {
  visible: boolean;
  onClose: () => void;
  locale?: string;
};

const labels: Record<string, { title: string; placeholder: string; send: string; cancel: string; thanks: string; thanksBody: string }> = {
  de: {
    title: 'Feedback senden',
    placeholder: 'Wie können wir SubTrack verbessern?',
    send: 'Senden',
    cancel: 'Abbrechen',
    thanks: 'Danke!',
    thanksBody: 'Dein Feedback hilft uns, SubTrack besser zu machen.',
  },
  fr: {
    title: 'Envoyer un avis',
    placeholder: 'Comment améliorer SubTrack ?',
    send: 'Envoyer',
    cancel: 'Annuler',
    thanks: 'Merci !',
    thanksBody: 'Votre avis nous aide à améliorer SubTrack.',
  },
  es: {
    title: 'Enviar opinión',
    placeholder: '¿Cómo podemos mejorar SubTrack?',
    send: 'Enviar',
    cancel: 'Cancelar',
    thanks: '¡Gracias!',
    thanksBody: 'Tu opinión nos ayuda a mejorar SubTrack.',
  },
  en: {
    title: 'Send feedback',
    placeholder: 'How can we improve SubTrack?',
    send: 'Send',
    cancel: 'Cancel',
    thanks: 'Thank you!',
    thanksBody: 'Your feedback helps us improve SubTrack.',
  },
};

function getLabels(locale?: string) {
  const lang = locale?.split('-')[0] ?? 'en';
  return labels[lang] ?? labels.en;
}

export function FeedbackModal({ visible, onClose, locale }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const l = getLabels(locale);

  const reset = () => {
    setRating(null);
    setComment('');
    setSent(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = () => {
    if (rating === null) return;
    track.feedbackSubmitted({ rating: rating + 1, comment });
    setSent(true);

    // Also send via email if comment provided
    if (comment.trim()) {
      const subject = encodeURIComponent(`SubTrack Feedback — ${rating + 1}/5 stars`);
      const body = encodeURIComponent(`Rating: ${EMOJIS[rating]} (${rating + 1}/5)\n\n${comment}`);
      Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`).catch(() => {});
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {sent ? (
            <View style={styles.thanks}>
              <Text style={styles.thanksEmoji}>🎉</Text>
              <Text style={styles.thanksTitle}>{l.thanks}</Text>
              <Text style={styles.thanksBody}>{l.thanksBody}</Text>
              <Pressable style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeBtnText}>{l.cancel}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.title}>{l.title}</Text>

              <View style={styles.emojiRow}>
                {EMOJIS.map((emoji, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setRating(i)}
                    style={[styles.emojiBtn, rating === i && styles.emojiBtnActive]}
                    accessibilityRole="button"
                    accessibilityLabel={`${i + 1} / 5`}
                    accessibilityState={{ selected: rating === i }}
                  >
                    <Text style={[styles.emoji, rating === i && styles.emojiSelected]}>
                      {emoji}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder={l.placeholder}
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                style={styles.input}
                textAlignVertical="top"
              />

              <View style={styles.actions}>
                <Pressable style={styles.cancelBtn} onPress={handleClose}>
                  <Text style={styles.cancelText}>{l.cancel}</Text>
                </Pressable>
                <Pressable
                  style={[styles.sendBtn, rating === null && styles.sendBtnDisabled]}
                  onPress={submit}
                >
                  <Text style={styles.sendText}>{l.send}</Text>
                </Pressable>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
  },
  emojiBtnActive: {
    backgroundColor: theme.accentSoft,
    transform: [{ scale: 1.15 }],
  },
  emoji: { fontSize: 28 },
  emojiSelected: { fontSize: 32 },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: theme.text,
    minHeight: 110,
  },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  cancelText: { fontWeight: '600', color: theme.textMuted, fontSize: 16 },
  sendBtn: {
    flex: 2,
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: theme.accent,
  },
  sendBtnDisabled: { backgroundColor: theme.accentMuted },
  sendText: { fontWeight: '700', color: '#fff', fontSize: 16 },
  thanks: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  thanksEmoji: { fontSize: 48 },
  thanksTitle: { fontSize: 22, fontWeight: '700', color: theme.text },
  thanksBody: { color: theme.textMuted, textAlign: 'center', lineHeight: 22 },
  closeBtn: {
    marginTop: 8,
    backgroundColor: '#F2F2F7',
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  closeBtnText: { fontWeight: '600', color: theme.textMuted, fontSize: 16 },
});
