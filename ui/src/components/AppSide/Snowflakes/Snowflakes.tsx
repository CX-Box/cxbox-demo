import React, { useEffect, useRef } from 'react'
import { useAppSelector } from '@store'
import { isDateInRange } from './utils'
import snowflake from './icons/snowflake.svg'
import { flakesCount } from './constants'
import { EFeatureSettingKey } from '@interfaces/session'
import styles from './Snowflakes.module.css'

const Snowflakes: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const seasonalEffectsEnabled =
        useAppSelector(state =>
            state.session.featureSettings?.find(featureSetting => featureSetting.key === EFeatureSettingKey.seasonalEffectsEnabled)
        )?.value === 'true'

    const isEnabled = seasonalEffectsEnabled && isDateInRange()

    useEffect(() => {
        const canvas = canvasRef.current

        if (!isEnabled || !canvas || !canvas.parentElement) {
            return
        }

        let rafId: number | null = null
        const ctx = canvas.getContext('2d')!
        const container = canvas.parentElement
        let width = container.clientWidth
        let height = container.clientHeight
        let wind = 0
        let windTarget = 0

        canvas.width = width
        canvas.height = height

        const snowflakeImg = new Image()
        snowflakeImg.src = snowflake

        const flakes = Array.from({ length: flakesCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: 8 + Math.random() * 12,
            speedY: 0.5 + Math.random() * 1.5,
            speedX: 0,
            angle: Math.random() * Math.PI * 2,
            rotation: Math.random() * 0.02
        }))

        const resize = () => {
            width = container?.clientWidth
            height = container?.clientHeight
            canvas.width = width
            canvas.height = height
        }

        const update = () => {
            ctx.clearRect(0, 0, width, height)

            wind += (windTarget - wind) * 0.01

            flakes.forEach(flake => {
                flake.y += flake.speedY
                flake.x += wind + Math.sin(flake.angle) * 0.3
                flake.angle += flake.rotation

                if (flake.y > height) {
                    flake.y = -flake.r
                    flake.x = Math.random() * width
                }

                ctx.save()
                ctx.translate(flake.x, flake.y)
                ctx.rotate(flake.angle)
                ctx.drawImage(snowflakeImg, -flake.r / 2, -flake.r / 2, flake.r, flake.r)
                ctx.restore()
            })

            rafId = requestAnimationFrame(update)
        }

        const observer = new ResizeObserver(resize)
        observer.observe(container)

        snowflakeImg.onload = () => {
            if (rafId === null) {
                update()
            }
        }

        return () => {
            observer.disconnect()

            if (rafId !== null) {
                cancelAnimationFrame(rafId)
            }
        }
    }, [isEnabled])

    return isEnabled ? <canvas ref={canvasRef} className={styles.canvas} /> : null
}

export default Snowflakes
