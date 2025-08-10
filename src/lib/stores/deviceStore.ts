'use client'

import { create } from 'zustand'

export interface Device {
  id: string
  name: string
  type: 'ios' | 'android'
  status: 'connected' | 'disconnected' | 'busy'
  lastSeen: Date
  ipAddress?: string
}

interface DeviceStore {
  connectedDevices: Device[]
  isConnecting: boolean
  selectedDevice: Device | null
  
  // Actions
  addDevice: (device: Device) => void
  removeDevice: (deviceId: string) => void
  updateDeviceStatus: (deviceId: string, status: Device['status']) => void
  setSelectedDevice: (device: Device | null) => void
  setConnecting: (connecting: boolean) => void
  refreshDevices: () => Promise<void>
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  connectedDevices: [],
  isConnecting: false,
  selectedDevice: null,

  addDevice: (device: Device) =>
    set((state) => ({
      connectedDevices: [...state.connectedDevices.filter(d => d.id !== device.id), device],
    })),

  removeDevice: (deviceId: string) =>
    set((state) => ({
      connectedDevices: state.connectedDevices.filter(d => d.id !== deviceId),
      selectedDevice: state.selectedDevice?.id === deviceId ? null : state.selectedDevice,
    })),

  updateDeviceStatus: (deviceId: string, status: Device['status']) =>
    set((state) => ({
      connectedDevices: state.connectedDevices.map(d =>
        d.id === deviceId ? { ...d, status, lastSeen: new Date() } : d
      ),
    })),

  setSelectedDevice: (device: Device | null) => set({ selectedDevice: device }),

  setConnecting: (connecting: boolean) => set({ isConnecting: connecting }),

  refreshDevices: async () => {
    set({ isConnecting: true })
    try {
      // Call API to detect real devices
      const response = await fetch('/api/devices/detect')
      const data = await response.json()
      
      if (data.success) {
        set({ connectedDevices: data.devices })
      } else {
        console.error('Device detection failed:', data.error)
        set({ connectedDevices: [] })
      }
      
    } catch (error) {
      console.error('Failed to refresh devices:', error)
      set({ connectedDevices: [] })
    } finally {
      set({ isConnecting: false })
    }
  },
}))
