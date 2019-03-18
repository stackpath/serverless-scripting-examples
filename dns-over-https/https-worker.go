package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	ctx, cancelFn := context.WithCancel(context.Background())
	defer cancelFn()
	// Startup the cloudworker
	jsFile := "dist/index.js"
	if len(os.Args) > 1 {
		jsFile = os.Args[1]
	}
	cmd := exec.CommandContext(ctx, filepath.FromSlash("node_modules/.bin/cloudworker"), "-r", jsFile)
	cmd.Stdout, cmd.Stderr = os.Stdout, os.Stderr
	if err := cmd.Start(); err != nil {
		return err
	}
	// Get local path for cert
	_, filename, _, _ := runtime.Caller(0)
	localDir := filepath.Dir(filename)
	cert, key := filepath.Join(localDir, "local.pem"), filepath.Join(localDir, "local-key.pem")
	// Startup the https proxy on 3001
	errCh := make(chan error, 1)
	go func() {
		errCh <- http.ListenAndServeTLS(":3001", cert, key, http.HandlerFunc(handleReq))
	}()
	fmt.Println("HTTPS Listening on 3001")
	return <-errCh
}

func handleReq(w http.ResponseWriter, r *http.Request) {
	// Update some request vals to proxy and send it
	r.Host, r.RequestURI = "", ""
	r.URL.Scheme, r.URL.Host = "http", "localhost:3000"
	resp, err := http.DefaultClient.Do(r)
	if err != nil {
		w.WriteHeader(500)
		w.Write([]byte(fmt.Sprintf("Unexpected err: %v", err)))
		return
	}
	// Set response headers, then write w/ status and body
	for k, v := range resp.Header {
		w.Header()[k] = v
	}
	w.WriteHeader(resp.StatusCode)
	defer resp.Body.Close()
	if _, err := io.Copy(w, resp.Body); err != nil {
		log.Panic(err)
	}
}
