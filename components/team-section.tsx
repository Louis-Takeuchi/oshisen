import Image from "next/image";
import {
  getTeamAnswer,
  teamMembers,
  teamQuestions,
  type TeamQuestionId,
} from "../lib/team";
import styles from "./team-section.module.css";

function QuestionCard({
  question,
  index,
}: {
  question: { readonly id: TeamQuestionId; readonly label: string };
  index: number;
}) {
  return (
    <article
      className={styles.question}
      aria-labelledby={`team-question-${question.id}`}
    >
      <h3 id={`team-question-${question.id}`}>
        <span className={styles.questionNumber} aria-hidden="true">
          Q{String(index + 1).padStart(2, "0")}
        </span>
        {question.label}
      </h3>
      <dl className={styles.answers}>
        {teamMembers.map((member) => {
          const answer = getTeamAnswer(member, question.id);
          return (
            <div key={member.id} data-member={member.id}>
              <dt>
                <a href={`#team-${member.id}`}>{member.name}</a>
                {answer && (
                  <span className={styles.answerSource}>本人回答</span>
                )}
              </dt>
              <dd>
                {answer ? (
                  <p className={styles.answerText}>{answer}</p>
                ) : (
                  <p className={styles.pending}>本人の回答を準備中</p>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}

export function TeamSection() {
  const hasAnswers = teamMembers.some((member) =>
    teamQuestions.some((question) => getTeamAnswer(member, question.id)),
  );
  return (
    <section id="team" className={styles.team} aria-labelledby="team-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>MEET THE TEAM / 運営メンバー</p>
          <h2 id="team-title">
            つくっている私たちも、
            <br />
            <span>どんな人？</span>
          </h2>
        </div>
        <span className={styles.sticker} aria-hidden="true">
          はじめまして！
        </span>
      </div>
      <p className={styles.intro}>
        候補者の人となりを伝えるなら、つくり手のことも。
        <br />
        オシセンをつくる2人の担当と、肩書きだけでは分からない一面を紹介します。
      </p>

      <div className={styles.members}>
        {teamMembers.map((member) => (
          <article
            id={`team-${member.id}`}
            key={member.id}
            className={styles.member}
            data-member={member.id}
            aria-labelledby={`team-${member.id}-name`}
          >
            <figure className={styles.portrait}>
              <Image
                src={member.photo.src}
                alt={`オシセン ${member.role} ${member.name}（${member.fullName}）の写真`}
                width={member.photo.width}
                height={member.photo.height}
                style={{ objectPosition: member.photo.position }}
                className={styles.photo}
                unoptimized
              />
              <figcaption className={styles.role}>{member.role}</figcaption>
            </figure>
            <div className={styles.memberBody}>
              <div className={styles.nameRow}>
                <div>
                  <h3 id={`team-${member.id}-name`}>{member.name}</h3>
                  <p className={styles.fullName}>{member.fullName}</p>
                </div>
                <a
                  href={member.photo.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.photoLink}
                >
                  写真を大きく見る <span aria-hidden="true">↗</span>
                  <span className="sr-only">（新しいタブで開きます）</span>
                </a>
              </div>
              {getTeamAnswer(member, "personality") && (
                <div className={styles.selfDescription}>
                  <span>自分をひと言で / 本人回答</span>
                  <p>「{getTeamAnswer(member, "personality")}」</p>
                </div>
              )}
              <p className={styles.headline}>{member.headline}</p>
              <ul className={styles.tags} aria-label={`${member.name}の担当`}>
                {member.responsibilities.map((responsibility) => (
                  <li key={responsibility.label}>{responsibility.label}</li>
                ))}
              </ul>
              <dl className={styles.responsibilities}>
                {member.responsibilities.map((responsibility) => (
                  <div key={responsibility.label}>
                    <dt>{responsibility.label}</dt>
                    <dd>{responsibility.description}</dd>
                  </div>
                ))}
              </dl>
              <a className={styles.memberLink} href="#team-qa">
                人となりのQ&Aへ <span aria-hidden="true">↓</span>
              </a>
            </div>
          </article>
        ))}
      </div>
      <p className={styles.factNote}>
        写真・名前・担当：運営メンバーからの提供情報。この2人は運営者としての紹介であり、候補者一覧や政策マッチングの対象ではありません。
      </p>

      <section
        id="team-qa"
        className={styles.humanity}
        aria-labelledby="team-qa-title"
      >
        <p className={styles.eyebrow}>BEYOND THE ROLE / 肩書きの、その先へ</p>
        <h2 id="team-qa-title">仕事の話を、ちょっと離れて。</h2>
        <p className={styles.intro}>
          休日のこと、好きなこと、迷ったときのこと。
          <br />
          候補者の紹介と同じように、私たちにも聞いてみました。
          人柄を点数にしたり、相性を判定したりはしません。
        </p>
        <p className={styles.answerNotice}>
          <span>
            {hasAnswers ? "本人のことばで更新" : "Q&Aはただいま準備中"}
          </span>
          {hasAnswers
            ? "掲載している回答は本人からのものです。未回答の項目は、準備中と表示しています。"
            : "まずは質問をご紹介。性格や趣味、考え方については、本人の回答を受け取ってから掲載します。"}
        </p>
        <div className={styles.questionList}>
          {teamQuestions.slice(0, 3).map((question, index) => (
            <QuestionCard key={question.id} question={question} index={index} />
          ))}
        </div>
        <details className={styles.moreQuestions}>
          <summary>
            <span>もう少し深く、聞いてみる</span>
            <span className={styles.moreLabel}>
              考え方・きっかけなど、あと4問
            </span>
          </summary>
          <div className={styles.questionList}>
            {teamQuestions.slice(3).map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index + 3}
              />
            ))}
          </div>
        </details>
      </section>
    </section>
  );
}
