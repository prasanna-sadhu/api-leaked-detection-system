const { spawn } = require('child_process');
const path = require('path');
const Finding = require('../models/Finding');
const Notification = require('../models/Notification');

class DetectorService {
  /**
   * Spawn Python process to scan a file for secrets
   * @param {string} filePath - Path to the file to scan
   * @returns {Promise<Array>} - Array of findings
   */
  async scanFile(filePath) {
    return new Promise((resolve, reject) => {
      const detectorPath = path.join(__dirname, '../../detector/detector.py');
      
      // Try different Python command variations
      const pythonCommands = ['python', 'python3', 'py'];
      let pythonProcess;
      
      // Use first available Python command
      try {
        pythonProcess = spawn(pythonCommands[0], [detectorPath, filePath]);
      } catch (err) {
        reject(new Error(`Python not found. Please install Python from https://python.org`));
        return;
      }

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          
          if (result.error) {
            reject(new Error(result.error));
            return;
          }

          // Return findings - will be saved by the route with userId
          resolve(result.findings);
        } catch (err) {
          reject(new Error(`Failed to parse Python output: ${err.message}`));
        }
      });

      pythonProcess.on('error', (err) => {
        console.error('Python process error:', err.message);
        reject(new Error(`Failed to start Python process: ${err.message}. Make sure Python is installed and in your PATH.`));
      });
    });
  }

  /**
   * Save findings to MongoDB and create notifications for high-risk items
   * @param {Array} findings - Array of finding objects
   * @param {string} userId - User ID who performed the scan
   * @returns {Promise<Array>} - Array of saved findings
   */
  async saveFindings(findings, userId = null) {
    const savedFindings = [];

    for (const finding of findings) {
      try {
        console.log('💾 BEFORE SAVE - Finding data:');
        console.log('  - type:', finding.type, '(', typeof finding.type, ')');
        console.log('  - service:', finding.service, '(', typeof finding.service, ')');
        console.log('  - severity:', finding.severity, '(', typeof finding.severity, ')');
        console.log('  - risk_score:', finding.risk_score, '(', typeof finding.risk_score, ')');
        
        // Validate severity value before saving
        const validSeverities = ['critical', 'high', 'medium', 'low'];
        let severityValue = String(finding.severity).toLowerCase();
        
        if (!validSeverities.includes(severityValue)) {
          console.error('⚠️ Invalid severity:', finding.severity, '- defaulting to "medium"');
          severityValue = 'medium';
        }
        
        // EXPLICITLY map each field to ensure nothing is lost
        const findingData = {
          user: userId,
          type: String(finding.type),
          service: String(finding.service),
          severity: severityValue,
          risk_score: Number(finding.risk_score),
          description: String(finding.description),
          preview: String(finding.preview),
          source: String(finding.source),
          line_number: finding.line_number ? Number(finding.line_number) : undefined,
          confidence: finding.confidence ? Number(finding.confidence) : undefined
        };
        
        console.log('💾 MAPPED DATA:', JSON.stringify(findingData, null, 2));
        
        // Save finding to database with user reference
        const savedFinding = await Finding.create(findingData);
        
        console.log('✅ SAVED TO DB - Document:');
        console.log('  - _id:', savedFinding._id);
        console.log('  - type:', savedFinding.type);
        console.log('  - service:', savedFinding.service);
        console.log('  - severity:', savedFinding.severity);
        console.log('  - risk_score:', savedFinding.risk_score);
        console.log('  - user:', savedFinding.user);
        
        savedFindings.push(savedFinding);

        // Create notification if risk score >= 60
        if (savedFinding.risk_score >= 60) {
          await Notification.create({
            finding_id: savedFinding._id,
            user: userId,
            type: savedFinding.type,
            service: savedFinding.service,
            severity: savedFinding.severity,
            risk_score: savedFinding.risk_score,
            message: `High-risk ${savedFinding.type} detected in ${savedFinding.source}`,
            status: 'pending'
          });
        }
      } catch (err) {
        console.error(`❌ Error saving finding:`, err.message);
        console.error('Stack trace:', err.stack);
        console.error('Finding data was:', finding);
        
        // Try to save with minimal required fields
        try {
          console.log('🔄 Attempting fallback save with minimal fields...');
          const minimalFinding = {
            user: userId,
            type: finding.type || 'generic_secret',
            service: finding.service || 'Unknown',
            severity: ['critical', 'high', 'medium', 'low'].includes(finding.severity) ? finding.severity : 'medium',
            risk_score: finding.risk_score || 50,
            description: finding.description || 'Secret detected',
            preview: finding.preview || '***',
            source: finding.source || 'unknown'
          };
          const fallbackSave = await Finding.create(minimalFinding);
          console.log('✅ Fallback save succeeded');
          savedFindings.push(fallbackSave);
        } catch (fallbackErr) {
          console.error('❌ Fallback save also failed:', fallbackErr.message);
        }
      }
    }

    return savedFindings;
  }
}

module.exports = new DetectorService();
