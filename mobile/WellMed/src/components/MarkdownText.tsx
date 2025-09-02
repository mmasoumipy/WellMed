import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface MarkdownTextProps {
  children: string;
  style?: any;
}

export default function MarkdownText({ children, style }: MarkdownTextProps) {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];

    lines.forEach((line, lineIndex) => {
      if (!line.trim()) {
        // Empty line - add spacing
        elements.push(<View key={`space-${lineIndex}`} style={styles.lineSpacing} />);
        return;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <Text key={lineIndex} style={[styles.h3, style]}>
            {line.substring(4)}
          </Text>
        );
        return;
      }
      
      if (line.startsWith('## ')) {
        elements.push(
          <Text key={lineIndex} style={[styles.h2, style]}>
            {line.substring(3)}
          </Text>
        );
        return;
      }
      
      if (line.startsWith('# ')) {
        elements.push(
          <Text key={lineIndex} style={[styles.h1, style]}>
            {line.substring(2)}
          </Text>
        );
        return;
      }

      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        const bulletText = line.startsWith('• ') ? line.substring(2) : line.substring(2);
        elements.push(
          <View key={lineIndex} style={styles.bulletContainer}>
            <Text style={styles.bullet}>•</Text>
            <Text style={[styles.bulletText, style]}>
              {parseInlineMarkdown(bulletText)}
            </Text>
          </View>
        );
        return;
      }

      // Regular paragraph with inline formatting
      elements.push(
        <Text key={lineIndex} style={[styles.paragraph, style]}>
          {parseInlineMarkdown(line)}
        </Text>
      );
    });

    return elements;
  };

  const parseInlineMarkdown = (text: string) => {
    const parts: React.ReactElement[] = [];
    let currentIndex = 0;
    let partKey = 0;

    // Handle bold text (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold part
      if (match.index > currentIndex) {
        const beforeText = text.substring(currentIndex, match.index);
        if (beforeText) {
          parts.push(
            <Text key={partKey++} style={styles.regular}>
              {beforeText}
            </Text>
          );
        }
      }

      // Add the bold text
      parts.push(
        <Text key={partKey++} style={styles.bold}>
          {match[1]}
        </Text>
      );

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.substring(currentIndex);
      if (remainingText) {
        parts.push(
          <Text key={partKey++} style={styles.regular}>
            {remainingText}
          </Text>
        );
      }
    }

    // If no markdown found, return plain text
    if (parts.length === 0) {
      return text;
    }

    return parts;
  };

  return (
    <View style={styles.container}>
      {parseMarkdown(children)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // No specific container styles needed
  },
  lineSpacing: {
    height: 8,
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
    marginTop: 8,
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 16,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 16,
  },
  bullet: {
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: 8,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  bold: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  regular: {
    fontWeight: 'normal',
    color: colors.textPrimary,
  },
});