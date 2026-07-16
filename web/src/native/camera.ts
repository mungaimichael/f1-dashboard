import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

async function getReactionPhoto(source: CameraSource): Promise<string | null> {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.DataUrl,
    source,
    quality: 70,
    width: 1024,
    correctOrientation: true
  });

  return photo.dataUrl ?? null;
}

export async function captureReactionPhoto(): Promise<string | null> {
  return getReactionPhoto(CameraSource.Camera);
}

export async function pickReactionPhoto(): Promise<string | null> {
  return getReactionPhoto(CameraSource.Photos);
}
