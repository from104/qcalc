/**
 * @file device-info.ts
 * @description 이 파일은 Capacitor를 사용하여 모바일 디바이스 정보를 관리하고
 *              전역 window 객체에 할당하는 부트스트랩 파일입니다.
 */

import { Platform } from 'quasar';
import { boot } from 'quasar/wrappers';

// 타입 정의
export type OrientationType = 'portrait' | 'landscape';

// 네이티브에서 전달한 디바이스 정보 타입 정의
export interface NativeDeviceInfo {
  isTablet: boolean;
  isPhone: boolean;
  isFoldable: boolean;
  textZoomLevel: number;
}

// 디바이스 정보 타입 정의
export interface IDeviceInfoCapacitor {
  // 정적 정보
  model: string;
  platform: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  webViewVersion: string;
  // 디바이스 타입
  isTablet: boolean;
  isPhone: boolean;
  isFoldable: boolean;
  // 화면 관련 정보
  orientation: OrientationType;
  isScreenReaderEnabled: boolean;
  // 방향 제어 기능
  unlockOrientation: () => Promise<void>;
  lockToPortrait: () => Promise<void>;
  lockToLandscape: () => Promise<void>;
}

// AndroidInterface 타입 정의
export interface NativeAndroidInterface {
  isTablet(): boolean;
  isPhone(): boolean;
  isFoldable(): boolean;
  lockToPortrait(): void;
  lockToLandscape(): void;
  unlockOrientation(): void;
}

export interface IDeviceInfo {
  isTablet: boolean;
  isPhone: boolean;
  isFoldable: boolean;
  textZoomLevel: number;
  isInitialized: boolean;
}

class DeviceInfo implements IDeviceInfo {
  private static instance: DeviceInfo;
  private _isTablet: boolean = false;
  private _isPhone: boolean = false;
  private _isFoldable: boolean = false;
  private _textZoomLevel: number = 100;
  private _isInitialized: boolean = false;

  private constructor() {
    // private 생성자
  }

  public static getInstance(): DeviceInfo {
    if (!DeviceInfo.instance) {
      DeviceInfo.instance = new DeviceInfo();
    }
    return DeviceInfo.instance;
  }

  public async initialize(): Promise<void> {
    try {
      if (Platform.is.android && window.AndroidInterface) {
        // 안드로이드 네이티브 인터페이스 사용
        this._isTablet = await window.AndroidInterface.isTablet();
        console.log('isTablet:', this._isTablet);
        
        this._isPhone = await window.AndroidInterface.isPhone();
        console.log('isPhone:', this._isPhone);
        
        this._isFoldable = await window.AndroidInterface.isFoldable();
        console.log('isFoldable:', this._isFoldable);

        // nativeDeviceInfo가 주입되었는지 확인
        if (window.nativeDeviceInfo) {
          this._textZoomLevel = window.nativeDeviceInfo.textZoomLevel;
          console.log('textZoomLevel:', this._textZoomLevel);
        }
      } else {
        // 기본값 설정 (웹 환경 등)
        this._isPhone = true;
        console.log('isPhone (default):', this._isPhone);
        
        this._isTablet = false;
        console.log('isTablet (default):', this._isTablet);
        
        this._isFoldable = false;
        console.log('isFoldable (default):', this._isFoldable);
        
        this._textZoomLevel = 100;
        console.log('textZoomLevel (default):', this._textZoomLevel);
      }

      this._isInitialized = true;
      console.log('Device info initialized:', {
        isTablet: this._isTablet,
        isPhone: this._isPhone,
        isFoldable: this._isFoldable,
        textZoomLevel: this._textZoomLevel,
      });
    } catch (error) {
      console.error('Failed to initialize device info:', error);
      // 에러 발생 시 기본값 설정
      this._isPhone = true;
      console.log('isPhone (error):', this._isPhone);
      
      this._isTablet = false;
      console.log('isTablet (error):', this._isTablet);
      
      this._isFoldable = false;
      console.log('isFoldable (error):', this._isFoldable);
      
      this._textZoomLevel = 100;
      console.log('textZoomLevel (error):', this._textZoomLevel);
      
      this._isInitialized = true;
    }
  }

  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  public get isTablet(): boolean {
    console.log('get isTablet:', this._isTablet);
    return this._isTablet;
  }

  public get isPhone(): boolean {
    console.log('get isPhone:', this._isPhone);
    return this._isPhone;
  }

  public get isFoldable(): boolean {
    console.log('get isFoldable:', this._isFoldable);
    return this._isFoldable;
  }

  public get textZoomLevel(): number {
    console.log('get textZoomLevel:', this._textZoomLevel);
    return this._textZoomLevel;
  }
}

export default boot(async () => {
  const deviceInfo = DeviceInfo.getInstance();
  await deviceInfo.initialize();
});

// 다른 컴포넌트에서 사용할 수 있도록 export
export const getDeviceInfo = () => DeviceInfo.getInstance();
