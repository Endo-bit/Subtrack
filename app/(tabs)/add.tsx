/**
 * Add screen
 *
 * Fixes vs. previous version:
 *   - Removed useFocusEffect auto-scroll-to-top (user has ↑ FAB instead)
 *   - Category jump: measure ListHeaderComponent height via onLayout, then
 *     compute section offsets mathematically — always accurate regardless
 *     of what onLayout y-values are returned by CellRenderer children.
 *   - Alpha jump: getItemLayout provided so scrollToLocation works off-screen.
 *   - Scroll-to-top FAB (↑) with animated fade.
 */
import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { ServiceLogo } from '@/components/ServiceLogo';
import { useSubTrack } from '@/context/SubTrackContext';
import { theme, type as t_ } from '@/constants/theme';
import { AddListMode, Category, PresetService } from '@/types/subscription';
import { Strings } from '@/i18n/strings';
import { formatMoney } from '@/utils/currency';

// ── Layout constants (must match StyleSheet below) ─────────────────────────
// serviceRow: padding 12×2 + max(logo 40, text ~40) + marginBottom 8 = 72
// sectionHeaderWrap: paddingVertical 8×2 + captionBold lineHeight 18 = 34
const ITEM_H = 72;
const SECTION_H = 34;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const categoryOrder: Category[] = [
  'streaming', 'music', 'productivity', 'gaming', 'health', 'news', 'other',
];

const categoryColor: Record<Category, string> = {
  streaming: '#FF3B30', music: '#30D158', productivity: '#007AFF',
  gaming: '#FF9F0A', health: '#FF2D55', news: '#32ADE6', other: '#8E8E93',
};

// ── Component ──────────────────────────────────────────────────────────────
export default function AddScreen() {
  const { t, presetServices, currency } = useSubTrack();
  const dark = useColorScheme() === 'dark';
  const [query, setQuery] = useState('');
  const [listMode, setListMode] = useState<AddListMode>('alpha');
  const listRef = useRef<SectionList<PresetService>>(null);

  // Measured height of the ListHeaderComponent (needed for category offset math)
  const [headerHeight, setHeaderHeight] = useState(0);

  // Scroll-to-top FAB
  const [showTopBtn, setShowTopBtn] = useState(false);
  const topBtnOpacity = useRef(new Animated.Value(0)).current;

  const fadeTopBtn = useCallback((visible: boolean) => {
    if (visible === showTopBtn) return;
    setShowTopBtn(visible);
    Animated.timing(topBtnOpacity, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [showTopBtn, topBtnOpacity]);

  // ── Data ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => presetServices
      .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 80),
    [presetServices, query],
  );

  const sections = useMemo(() => {
    if (listMode === 'alpha') {
      return [{
        title: t.sortGroupAlpha,
        data: [...filtered].sort((a, b) => a.name.localeCompare(b.name)),
        category: null as Category | null,
      }];
    }
    return categoryOrder
      .map((cat) => ({
        title: categoryLabel(t, cat),
        data: filtered
          .filter((s) => s.category === cat)
          .sort((a, b) => a.name.localeCompare(b.name)),
        category: cat as Category | null,
      }))
      .filter((sec) => sec.data.length > 0);
  }, [filtered, listMode, t]);

  // ── getItemLayout for alpha mode scrollToLocation ─────────────────────────
  const getItemLayout = useCallback(
    (_: any, index: number) => {
      let offset = 0;
      let flatIdx = 0;
      for (const sec of sections) {
        if (flatIdx === index) return { length: SECTION_H, offset, index };
        offset += SECTION_H;
        flatIdx++;
        for (let i = 0; i < sec.data.length; i++) {
          if (flatIdx === index) return { length: ITEM_H, offset, index };
          offset += ITEM_H;
          flatIdx++;
        }
      }
      return { length: ITEM_H, offset, index };
    },
    [sections],
  );

  // ── Scroll helpers ────────────────────────────────────────────────────────
  const getInnerList = () =>
    (listRef.current as any)?._wrapperListRef?.getListRef?.();

  const scrollToTop = useCallback(() => {
    getInnerList()?.scrollToOffset?.({ offset: 0, animated: true });
  }, []);

  // Alpha: jump to letter (uses scrollToLocation + getItemLayout)
  const letterSet = useMemo<Set<string>>(() => {
    if (listMode !== 'alpha' || !sections[0]) return new Set();
    return new Set(sections[0].data.map((s) => s.name[0]?.toUpperCase() ?? '#'));
  }, [sections, listMode]);

  const scrollToLetter = useCallback(
    (letter: string) => {
      if (listMode !== 'alpha' || !sections[0]) return;
      const data = sections[0].data;
      let idx = data.findIndex((s) => s.name.toUpperCase() >= letter);
      if (idx < 0) idx = data.length - 1;
      if (idx < 0) return;
      try {
        listRef.current?.scrollToLocation({
          sectionIndex: 0,
          itemIndex: idx,
          animated: false,
          viewOffset: SECTION_H,
        });
      } catch {}
    },
    [listMode, sections],
  );

  // Category: compute offset = headerHeight + sum of preceding sections
  // This is mathematical — no reliance on onLayout y-values inside CellRenderers.
  const scrollToSection = useCallback(
    (sectionIdx: number) => {
      if (!sections[sectionIdx] || headerHeight === 0) return;
      let offset = headerHeight;
      for (let i = 0; i < sectionIdx; i++) {
        offset += SECTION_H;                         // section header
        offset += sections[i].data.length * ITEM_H;  // items
      }
      getInnerList()?.scrollToOffset?.({ offset: Math.max(0, offset - 4), animated: true });
    },
    [headerHeight, sections],
  );

  const bg = dark ? theme.creamDark : theme.cream;

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        contentContainerStyle={styles.listContent}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={() => {}}
        onScroll={({ nativeEvent }) => {
          fadeTopBtn(nativeEvent.contentOffset.y > 200);
        }}
        scrollEventThrottle={80}

        // ── List header — wrap in View with onLayout to measure height ──
        ListHeaderComponent={
          <View
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (h > 0 && h !== headerHeight) setHeaderHeight(h);
            }}
          >
            <View style={[styles.header, { backgroundColor: bg }]}>
              <Text style={[styles.title, dark && styles.textOnDark]}>{t.addSub}</Text>

              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t.search}
                placeholderTextColor={theme.textMuted}
                style={[styles.input, dark && styles.inputDark]}
              />

              <Text style={[styles.sortLabel, dark && { color: theme.textMuted }]}>
                {t.addListSortLabel}
              </Text>
              <View style={[styles.segment, { backgroundColor: dark ? theme.cardDark : theme.card }]}>
                <SegBtn label={t.sortGroupAlpha} active={listMode === 'alpha'} onPress={() => setListMode('alpha')} />
                <SegBtn label={t.sortGroupCategory} active={listMode === 'category'} onPress={() => setListMode('category')} />
              </View>

              {/* Category quick-jump pills */}
              {listMode === 'category' && sections.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.catScrollContent}
                >
                  {sections.map((sec, idx) => (
                    <Pressable
                      key={sec.title}
                      onPress={() => scrollToSection(idx)}
                      style={[
                        styles.catPill,
                        sec.category
                          ? { backgroundColor: categoryColor[sec.category] + '22' }
                          : { backgroundColor: dark ? theme.cardDark : '#EBEBF0' },
                      ]}
                    >
                      {sec.category && (
                        <View style={[styles.catDot, { backgroundColor: categoryColor[sec.category] }]} />
                      )}
                      <Text style={[styles.catPillText, dark && styles.textOnDark]}>
                        {sec.title}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              {filtered.length === 0 && (
                <View style={styles.emptyWrap}>
                  <Text style={[styles.emptyTitle, dark && styles.textOnDark]}>{t.emptyAddTitle}</Text>
                  <Text style={styles.emptyBody}>{t.emptyAddBody}</Text>
                </View>
              )}
            </View>
          </View>
        }

        // ── Section headers ───────────────────────────────────────────────
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeaderWrap, { backgroundColor: bg }]}>
            {section.category && (
              <View style={[styles.sectionDot, { backgroundColor: categoryColor[section.category] }]} />
            )}
            <Text style={[styles.sectionHeaderText, dark && { color: theme.textMuted }]}>
              {section.title}
            </Text>
          </View>
        )}

        // ── Items ─────────────────────────────────────────────────────────
        renderItem={({ item }) => (
          <Pressable
            style={[styles.serviceRow, dark && styles.serviceRowDark]}
            onPress={() => router.push(`/service/${item.id}`)}
          >
            <ServiceLogo service={item} size={40} />
            <View style={styles.serviceMain}>
              <Text style={[styles.serviceName, dark && styles.textOnDark]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.serviceMeta}>
                {formatMoney(item.defaultPrice, currency)} · {categoryLabel(t, item.category)}
              </Text>
            </View>
          </Pressable>
        )}

        ListFooterComponent={
          <Pressable onPress={() => router.push('/service/manual')} style={styles.manual}>
            <Text style={styles.manualText}>{t.manual}</Text>
          </Pressable>
        }
      />

      {/* ── A–Z index bar (alpha mode) ────────────────────────────────────── */}
      {listMode === 'alpha' && filtered.length > 0 && (
        <View style={styles.alphaBar} pointerEvents="box-none">
          {ALPHABET.map((letter) => {
            const active = letterSet.has(letter);
            return (
              <Pressable
                key={letter}
                onPress={() => scrollToLetter(letter)}
                hitSlop={4}
                style={styles.alphaItem}
              >
                <Text style={[styles.alphaText, !active && styles.alphaTextDim]}>
                  {letter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Scroll-to-top FAB ─────────────────────────────────────────────── */}
      <Animated.View
        style={[styles.topBtn, { opacity: topBtnOpacity }]}
        pointerEvents={showTopBtn ? 'auto' : 'none'}
      >
        <Pressable onPress={scrollToTop} style={styles.topBtnInner} hitSlop={8}>
          <Text style={styles.topBtnArrow}>↑</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function categoryLabel(t: Strings, cat: Category): string {
  const map: Record<Category, keyof Strings> = {
    streaming: 'catStreaming', music: 'catMusic', productivity: 'catProductivity',
    gaming: 'catGaming', health: 'catHealth', news: 'catNews', other: 'catOther',
  };
  return t[map[cat]];
}

function SegBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.segBtn, active && styles.segBtnActive]}>
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },
  // paddingRight: 30 keeps items left of the alphabet bar
  listContent: { paddingHorizontal: 16, paddingRight: 30, paddingBottom: 48 },

  header: { gap: 10, paddingTop: 60, paddingBottom: 8 },
  title: { ...t_.displayMd, color: theme.text, paddingHorizontal: 4 },
  textOnDark: { color: '#FFFFFF' },

  input: {
    backgroundColor: theme.card,
    borderRadius: 9999,
    paddingVertical: 11,
    paddingHorizontal: 18,
    ...t_.body,
    color: theme.text,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  inputDark: { backgroundColor: theme.cardDark, color: '#FFF', borderColor: theme.borderDark },

  sortLabel: { ...t_.captionBold, color: theme.text, paddingHorizontal: 4 },

  segment: {
    flexDirection: 'row',
    borderRadius: 11,
    padding: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  segBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  segBtnActive: { backgroundColor: theme.accent },
  segText: { ...t_.captionBold, color: theme.textMuted },
  segTextActive: { color: '#FFF' },

  catScrollContent: { gap: 8, paddingHorizontal: 4, paddingVertical: 2 },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  catDot: { width: 7, height: 7, borderRadius: 4 },
  catPillText: { ...t_.captionBold, color: theme.text, fontSize: 12 },

  // Section header: height must match SECTION_H (34px)
  sectionHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,   // 8+8 = 16
    paddingHorizontal: 4,
    // lineHeight of captionBold = 18 → total = 34 ✓
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionHeaderText: {
    ...t_.captionBold,
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },

  // Service row: height must match ITEM_H (72px)
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 12,          // 12+12 = 24 vertical padding
    marginBottom: 8,      // 24 + 40 (content) + 8 = 72 ✓
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  serviceRowDark: { backgroundColor: theme.cardDark, borderColor: theme.borderDark },
  serviceMain: { flex: 1 },
  serviceName: { ...t_.labelStrong, color: theme.text },
  serviceMeta: { ...t_.caption, color: theme.textMuted, marginTop: 1 },

  manual: {
    padding: 14,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.accent,
    alignItems: 'center',
    marginTop: 4,
  },
  manualText: { ...t_.button, color: theme.accent },

  emptyWrap: { paddingVertical: 24, alignItems: 'center', gap: 6 },
  emptyTitle: { ...t_.labelStrong, color: theme.text },
  emptyBody: { ...t_.body, color: theme.textMuted, textAlign: 'center' },

  // ── A–Z index bar ────────────────────────────────────────────────────────
  alphaBar: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    zIndex: 10,
  },
  alphaItem: { width: 22, alignItems: 'center', justifyContent: 'center', paddingVertical: 1.5 },
  alphaText: { fontSize: 11, fontWeight: '700', color: theme.accent, lineHeight: 14 },
  alphaTextDim: { color: theme.textMuted, fontWeight: '400' },

  // ── Scroll-to-top FAB ────────────────────────────────────────────────────
  topBtn: { position: 'absolute', bottom: 28, left: 20, zIndex: 20 },
  topBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  topBtnArrow: { fontSize: 18, fontWeight: '700', color: theme.accent, lineHeight: 22 },
});
