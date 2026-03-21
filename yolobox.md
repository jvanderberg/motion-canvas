# Yolobox Setup

When running in a yolobox VM, the dev server is accessible from the host browser
via mDNS:

```bash
/yolobox/scripts/yolobox-open-url http://$(hostname).local:9000
```

Other useful yolobox commands:

- Open Finder: `/yolobox/scripts/finder /workspace`
- Open VS Code: `/yolobox/scripts/code /workspace`
- Open terminal: `/yolobox/scripts/terminal`
- Open artifact: `/yolobox/scripts/yolobox-open /workspace/.artifacts/frame.png`
