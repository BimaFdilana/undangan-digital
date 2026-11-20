// Kompres video untuk web memakai AVFoundation bawaan macOS (tanpa ffmpeg).
// Pakai:  swiftc -O scripts/compress-video.swift -o /tmp/compress-video
//         /tmp/compress-video <masuk.mp4> <keluar.mp4> <lebar> <tinggi> <fps> <bitrate>
// Contoh (portret, 540x960, 30 fps, 0,85 Mbps; hasil tanpa trek audio):
//         /tmp/compress-video asli.mp4 ringan.mp4 540 960 30 850000

import AVFoundation
import Foundation

let a = CommandLine.arguments
let src = URL(fileURLWithPath: a[1]), dst = URL(fileURLWithPath: a[2])
let w = Int(a[3])!, h = Int(a[4])!, fps = Int(a[5])!, bitrate = Int(a[6])!
try? FileManager.default.removeItem(at: dst)

let asset = AVURLAsset(url: src)
let sem = DispatchSemaphore(value: 0)

Task {
    do {
        let track = try await asset.loadTracks(withMediaType: .video)[0]
        let dur = try await asset.load(.duration)
        let nat = try await track.load(.naturalSize)
        let pt = try await track.load(.preferredTransform)

        let comp = AVMutableVideoComposition()
        comp.renderSize = CGSize(width: w, height: h)
        comp.frameDuration = CMTime(value: 1, timescale: CMTimeScale(fps))
        let inst = AVMutableVideoCompositionInstruction()
        inst.timeRange = CMTimeRange(start: .zero, duration: dur)
        let layer = AVMutableVideoCompositionLayerInstruction(assetTrack: track)
        layer.setTransform(pt.concatenating(CGAffineTransform(scaleX: CGFloat(w) / nat.width, y: CGFloat(h) / nat.height)), at: .zero)
        inst.layerInstructions = [layer]
        comp.instructions = [inst]

        let reader = try AVAssetReader(asset: asset)
        let out = AVAssetReaderVideoCompositionOutput(
            videoTracks: [track],
            videoSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange]
        )
        out.videoComposition = comp
        reader.add(out)

        let writer = try AVAssetWriter(outputURL: dst, fileType: .mp4)
        writer.shouldOptimizeForNetworkUse = true
        let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: w, AVVideoHeightKey: h,
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: bitrate,
                AVVideoProfileLevelKey: AVVideoProfileLevelH264MainAutoLevel,
                AVVideoMaxKeyFrameIntervalKey: fps * 2,
                AVVideoExpectedSourceFrameRateKey: fps,
            ],
        ])
        writer.add(input)
        let okRead = reader.startReading()
        if !okRead { print("reader gagal:", reader.error as Any); sem.signal(); return }
        writer.startWriting()
        writer.startSession(atSourceTime: .zero)

        let q = DispatchQueue(label: "enc")
        input.requestMediaDataWhenReady(on: q) {
            while input.isReadyForMoreMediaData {
                if reader.status != .reading { print("reader status", reader.status.rawValue, reader.error as Any); input.markAsFinished(); writer.finishWriting { sem.signal() }; break }
                if let sb = out.copyNextSampleBuffer() {
                    input.append(sb)
                } else {
                    input.markAsFinished()
                    writer.finishWriting {
                        print("selesai, status:", writer.status.rawValue, writer.error?.localizedDescription ?? "")
                        sem.signal()
                    }
                    break
                }
            }
        }
    } catch {
        print("gagal:", error)
        sem.signal()
    }
}
sem.wait()
