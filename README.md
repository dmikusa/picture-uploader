## Picture Uploader

A single page app that can be used as an easy way to upload pictures and videos to a server.  The app provides an easy to use UI for selecting pictures and uploading them.  There is also a very simple server written in Golang which accepts the files and saves them to the local file system.

The original use case was for an easy way to transfer original images and videos from an iPhone to a server for backup and to free up space on the phone.

## Usage

### Go Server App

1. Install Go & setup GOPATH / GOROOT
2. Run `go run server.go`

The URL to access in your browser will be printed out, but by default the app listens on port 5001 so http://localhost:5001/ should work.
