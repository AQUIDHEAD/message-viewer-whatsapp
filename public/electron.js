const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

let mediaFolderPath = '';

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        }
    });

    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    } else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, '../build/index.html'),
            protocol: 'file:',
            slashes: true
        }));
        // Open DevTools in production for debugging
        win.webContents.openDevTools();
    }

    // Select chat file
    ipcMain.handle('select-chat-file', async () => {
        try {
            const result = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [{ name: 'Text Files', extensions: ['txt'] }]
            });

            if (!result.canceled && result.filePaths.length > 0) {
                const filePath = result.filePaths[0];
                // Store the directory containing the chat file
                mediaFolderPath = path.dirname(filePath);
                console.log('Media folder path set to:', mediaFolderPath);
                const data = await fs.promises.readFile(filePath, 'utf8');
                return { data, mediaFolderPath };
            }
            return null;
        } catch (error) {
            console.error('Error reading chat file:', error);
            throw error;
        }
    });

    // Get media file path
    ipcMain.handle('get-media-file', async (event, fileName) => {
        try {
            const filePath = path.join(mediaFolderPath, fileName);
            console.log('Looking for media file at:', filePath);
            
            // Check if file exists
            if (fs.existsSync(filePath)) {
                return filePath;
            }
            console.log('File not found:', filePath);
            return null;
        } catch (error) {
            console.error('Error getting media file:', error);
            throw error;
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});