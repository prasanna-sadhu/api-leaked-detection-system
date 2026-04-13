"""
Secret Detection Engine
Scans files for sensitive information like API keys, tokens, and credentials.
"""

import re
import json
import sys
from typing import List, Dict, Any


class SecretDetector:
    """Detects various types of secrets and credentials in files."""
    
    # Pattern definitions for different secret types
    PATTERNS = {
        'aws_access_key': {
            'pattern': r'(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}',
            'service': 'AWS',
            'severity': 'critical',
            'description': 'AWS Access Key ID'
        },
        'aws_secret_key': {
            'pattern': r'(?i)aws[_\-]?secret[_\-]?access[_\-]?key[_\-]?[=:]\s*[\'"]?([A-Za-z0-9/+=]{40})[\'"]?',
            'service': 'AWS',
            'severity': 'critical',
            'description': 'AWS Secret Access Key'
        },
        'github_token': {
            'pattern': r'(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}',
            'service': 'GitHub',
            'severity': 'critical',
            'description': 'GitHub Personal Access Token'
        },
        'github_oauth': {
            'pattern': r'github_pat_[A-Za-z0-9_]{22}_[A-Za-z0-9_]{59}',
            'service': 'GitHub',
            'severity': 'critical',
            'description': 'GitHub OAuth Token'
        },
        'slack_token': {
            'pattern': r'xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*',
            'service': 'Slack',
            'severity': 'high',
            'description': 'Slack Token'
        },
        'slack_webhook': {
            'pattern': r'https://hooks\.slack\.com/services/T[a-zA-Z0-9_]{8}/B[a-zA-Z0-9_]{8}/[a-zA-Z0-9_]{24}',
            'service': 'Slack',
            'severity': 'high',
            'description': 'Slack Webhook URL'
        },
        'google_api_key': {
            'pattern': r'AIza[0-9A-Za-z\-_]{35}',
            'service': 'Google',
            'severity': 'high',
            'description': 'Google API Key'
        },
        'google_oauth': {
            'pattern': r'[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com',
            'service': 'Google',
            'severity': 'medium',
            'description': 'Google OAuth Client ID'
        },
        'stripe_key': {
            'pattern': r'(?:sk|pk)_(?:test|live)_[0-9a-zA-Z]{24,}',
            'service': 'Stripe',
            'severity': 'critical',
            'description': 'Stripe API Key'
        },
        'stripe_restricted_key': {
            'pattern': r'rk_(?:test|live)_[0-9a-zA-Z]{24,}',
            'service': 'Stripe',
            'severity': 'critical',
            'description': 'Stripe Restricted Key'
        },
        'twilio_key': {
            'pattern': r'SK[0-9a-fA-F]{32}',
            'service': 'Twilio',
            'severity': 'high',
            'description': 'Twilio API Key'
        },
        'twilio_sid': {
            'pattern': r'AC[0-9a-fA-F]{32}',
            'service': 'Twilio',
            'severity': 'medium',
            'description': 'Twilio Account SID'
        },
        'sendgrid_key': {
            'pattern': r'SG\.[0-9A-Za-z\-_]{22}\.[0-9A-Za-z\-_]{43}',
            'service': 'SendGrid',
            'severity': 'high',
            'description': 'SendGrid API Key'
        },
        'mailgun_key': {
            'pattern': r'key-[0-9a-zA-Z]{32}',
            'service': 'Mailgun',
            'severity': 'high',
            'description': 'Mailgun API Key'
        },
        'private_key': {
            'pattern': r'-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----',
            'service': 'Generic',
            'severity': 'critical',
            'description': 'Private Key'
        },
        'jwt_token': {
            'pattern': r'eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+',
            'service': 'Generic',
            'severity': 'medium',
            'description': 'JWT Token'
        },
        'password_in_url': {
            'pattern': r'(?:https?|ftp)://[^:/]+:[^@]+@',
            'service': 'Generic',
            'severity': 'high',
            'description': 'Password in URL'
        },
        'generic_secret': {
            'pattern': r'(?i)(?:api[_\-]?key|secret[_\-]?key|password|passwd|pwd|token|auth[_\-]?token|access[_\-]?token)[_\s]*[=:]\s*[\'"][^\'"]{8,}[\'"]',
            'service': 'Generic',
            'severity': 'medium',
            'description': 'Generic Secret'
        }
    }
    
    SEVERITY_SCORES = {
        'critical': 95.0,
        'high': 75.0,
        'medium': 50.0,
        'low': 25.0
    }
    
    def __init__(self):
        self.compiled_patterns = {}
        for key, config in self.PATTERNS.items():
            self.compiled_patterns[key] = re.compile(config['pattern'], re.IGNORECASE if 'generic' in key else 0)
    
    def scan_file(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Scan a file for secrets and return findings.
        
        Args:
            file_path: Path to the file to scan
            
        Returns:
            List of findings with details about detected secrets
        """
        findings = []
        
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.split('\n')
                
            for pattern_name, regex in self.compiled_patterns.items():
                matches = regex.finditer(content)
                
                for match in matches:
                    matched_text = match.group(0)
                    
                    # Calculate line number
                    start_pos = match.start()
                    line_number = content[:start_pos].count('\n') + 1
                    
                    # Get the line content for preview
                    line_content = lines[line_number - 1] if line_number <= len(lines) else ""
                    
                    # Create preview (truncate if too long)
                    preview = matched_text[:50] + '...' if len(matched_text) > 50 else matched_text
                    
                    finding = {
                        'type': pattern_name,
                        'service': self.PATTERNS[pattern_name]['service'],
                        'severity': self.PATTERNS[pattern_name]['severity'],
                        'risk_score': self._calculate_risk_score(pattern_name, line_content),
                        'description': self.PATTERNS[pattern_name]['description'],
                        'preview': self._sanitize_preview(preview),
                        'source': file_path,
                        'line_number': line_number,
                        'confidence': self._calculate_confidence(pattern_name, matched_text)
                    }
                    
                    findings.append(finding)
                    
        except FileNotFoundError:
            error_result = {
                'error': f'File not found: {file_path}',
                'findings': []
            }
            return [error_result]
        except Exception as e:
            error_result = {
                'error': f'Error scanning file: {str(e)}',
                'findings': []
            }
            return [error_result]
        
        return findings
    
    def _calculate_risk_score(self, pattern_name: str, line_content: str) -> float:
        """Calculate risk score based on pattern type and context."""
        severity = self.PATTERNS[pattern_name]['severity']
        base_score = self.SEVERITY_SCORES.get(severity, 50.0)
        
        # Ensure base score is never None
        if base_score is None:
            base_score = 50.0
        
        # Increase score if near keywords like production, prod, live, etc.
        high_risk_keywords = ['prod', 'production', 'live', 'real', 'actual']
        if any(keyword in line_content.lower() for keyword in high_risk_keywords):
            base_score = min(100.0, base_score + 10)
        
        # Return integer score (MongoDB expects Number, backend validates 0-100)
        return int(round(base_score, 0))
    
    def _calculate_confidence(self, pattern_name: str, matched_text: str) -> float:
        """Calculate confidence score for the detection."""
        # Higher confidence for more specific patterns
        high_confidence_patterns = ['aws_access_key', 'github_token', 'private_key']
        if pattern_name in high_confidence_patterns:
            return 95.0
        
        medium_confidence_patterns = ['stripe_key', 'slack_token', 'google_api_key']
        if pattern_name in medium_confidence_patterns:
            return 85.0
        
        return 75.0
    
    def _sanitize_preview(self, text: str) -> str:
        """Sanitize preview to avoid exposing full secrets."""
        if len(text) > 20:
            return text[:8] + '*' * (len(text) - 12) + text[-4:]
        return text


def main():
    """Main entry point for command-line execution."""
    if len(sys.argv) < 2:
        print(json.dumps({
            'error': 'No file path provided',
            'usage': 'python detector.py <file_path>',
            'findings': []
        }))
        sys.exit(1)
    
    file_path = sys.argv[1]
    detector = SecretDetector()
    findings = detector.scan_file(file_path)
    
    # Output results as JSON
    print(json.dumps({
        'file': file_path,
        'findings_count': len(findings),
        'findings': findings
    }, indent=2))


if __name__ == '__main__':
    main()
