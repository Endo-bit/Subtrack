import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export type PickIconResult = { status: 'picked'; uri: string } | { status: 'cancelled' } | { status: 'denied' };

/** Picks an image from the photo library and copies it into app storage. */
export async function pickCustomIcon(): Promise<PickIconResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.[0]) return { status: 'cancelled' };

  const picked = result.assets[0];
  const ext = picked.uri.split('.').pop()?.split('?')[0] || 'jpg';
  const dest = new File(Paths.document, `logo-${Date.now()}.${ext}`);
  new File(picked.uri).copy(dest);
  return { status: 'picked', uri: dest.uri };
}
