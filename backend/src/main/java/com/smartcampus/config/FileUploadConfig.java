package com.smartcampus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FileUploadConfig {

  @Value("${file.upload.max-size:5242880}")
  private long maxFileSize;

  @Value("${file.upload.path:/uploads}")
  private String uploadPath;

  public long getMaxFileSize() {
    return maxFileSize;
  }

  public String getUploadPath() {
    return uploadPath;
  }
}
