const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Mock dependencies
jest.mock('axios', () => {
  const mockAxios = jest.fn();
  mockAxios.get = jest.fn();
  mockAxios.default = mockAxios; // Allow axios.default usage if any
  return mockAxios;
});

jest.mock('fs');
jest.mock('electron', () => ({
  app: {
    isPackaged: true,
    getVersion: jest.fn(() => '1.0.0'),
    getPath: jest.fn(() => 'C:\\Temp')
  }
}));

describe('AutoUpdater', () => {
  let AutoUpdater;
  let updater;
  const mockServerUrl = 'http://test-server.com';
  
  beforeEach(() => {
    jest.resetModules(); 
    jest.clearAllMocks();
    
    // Setup fs mocks
    const fsMock = require('fs');
    if (fsMock.existsSync && fsMock.existsSync.mockReturnValue) {
        fsMock.existsSync.mockReturnValue(true);
    } else {
        fsMock.existsSync = jest.fn().mockReturnValue(true);
    }
    
    if (fsMock.mkdirSync) {
        if (fsMock.mkdirSync.mockImplementation) fsMock.mkdirSync.mockImplementation(() => {});
        else fsMock.mkdirSync = jest.fn();
    }
    
    if (!fsMock.statSync || !fsMock.statSync.mockReturnValue) fsMock.statSync = jest.fn();
    if (!fsMock.createWriteStream || !fsMock.createWriteStream.mockReturnValue) fsMock.createWriteStream = jest.fn();
    
    AutoUpdater = require('../electron/updater.cjs');
    
    updater = new AutoUpdater({
      serverUrl: mockServerUrl,
      softwareId: 'test-app'
    });
  });

  describe('checkUpdate', () => {
    it('should return update info when update is available', async () => {
      const mockResponse = {
        data: {
          has_update: true,
          version: '1.1.0',
          download_url: '/download/v1.1.0.zip',
          update_log: 'Fix bugs'
        }
      };
      
      const axiosMock = require('axios');
      // axiosMock is the function now
      axiosMock.get.mockResolvedValue(mockResponse);
      
      const result = await updater.checkUpdate();
      
      expect(result.hasUpdate).toBe(true);
      expect(result.version).toBe('1.1.0');
      expect(result.downloadUrl).toBe('/download/v1.1.0.zip');
    });

    it('should return no update when version is latest', async () => {
      const mockResponse = {
        data: {
          has_update: false
        }
      };
      
      const axiosMock = require('axios');
      axiosMock.get.mockResolvedValue(mockResponse);
      
      const result = await updater.checkUpdate();
      
      expect(result.hasUpdate).toBe(false);
    });
  });

  describe('downloadUpdate', () => {
    it('should download file successfully', async () => {
      const updateInfo = {
        version: '1.1.0',
        downloadUrl: '/files/update.zip',
        packageSize: 1024
      };
      
      const fsMock = require('fs');
      if (fsMock.existsSync.mockReturnValue) {
        fsMock.existsSync.mockReturnValue(false);
      }
      
      const mockWriteStream = {
        on: jest.fn((event, cb) => {
             if (event === 'close') setTimeout(cb, 10);
             return mockWriteStream;
        }),
        end: jest.fn(),
        destroy: jest.fn(),
        write: jest.fn()
      };
      
      if (fsMock.createWriteStream.mockReturnValue) {
        fsMock.createWriteStream.mockReturnValue(mockWriteStream);
      } else {
        fsMock.createWriteStream = jest.fn().mockReturnValue(mockWriteStream);
      }
      
      const mockStream = {
        on: jest.fn((event, callback) => {
          if (event === 'end') setTimeout(callback, 5);
          if (event === 'data') callback(Buffer.from('test'));
          return mockStream;
        }),
        pipe: jest.fn()
      };
      
      const axiosMock = require('axios');
      // axiosMock is the function
      axiosMock.mockResolvedValue({
        data: mockStream,
        headers: { 'content-length': '1024' }
      });

      const promise = updater.downloadUpdate(updateInfo);
      const result = await promise;
      
      expect(result).toContain('test-app_v1.1.0.zip');
    });
  });
});
